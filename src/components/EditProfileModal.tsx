import React, { useState, useRef } from 'react';
import { X, Camera, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { apiFetch } from '../lib/api';


interface EditProfileModalProps {
  profile: any;
  onClose: () => void;
  onSave: (updated: any) => void;
  showToast?: (m: string, t?: any) => void;
}

export default function EditProfileModal({ profile, onClose, onSave, showToast }: EditProfileModalProps) {
  const [name, setName] = useState(profile.name || '');
  const [age, setAge] = useState(profile.age?.toString() || '');
  const [location, setLocation] = useState(profile.location || '');
  const [job, setJob] = useState(profile.job || '');
  const [about, setAbout] = useState(profile.about || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar || profile.image || '');
  const [mainImage, setMainImage] = useState(profile.main_image || '');
  const [album, setAlbum] = useState<string[]>(profile.album || []);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingAlbum, setUploadingAlbum] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `profile-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filename, file, { cacheControl: '3600', upsert: false });
    if (error || !data) throw error;
    const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (showToast) showToast('请选择图片文件', 'error');
      else alert('请选择图片文件');
      return;
    }
    setUploadingAvatar(true);
    try {
      const url = await uploadFile(file);
      setAvatarUrl(url);
      if (showToast) showToast('头像已上传', 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('头像上传失败', 'error');
      else alert('头像上传失败');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMainImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingMain(true);
    try {
      const url = await uploadFile(file);
      setMainImage(url);
      if (showToast) showToast('展示背景已上传', 'success');
    } catch (err) {
      if (showToast) showToast('上传失败', 'error');
    } finally {
      setUploadingMain(false);
      if (mainImageInputRef.current) mainImageInputRef.current.value = '';
    }
  };

  const handleAlbumSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    const validFiles = files.filter(f => f.type.startsWith('image/')).slice(0, 9 - album.length);
    if (validFiles.length === 0) return;
    
    setUploadingAlbum(true);
    try {
      const newUrls: string[] = [];
      for (const file of validFiles) {
        const url = await uploadFile(file);
        newUrls.push(url);
      }
      setAlbum(prev => [...prev, ...newUrls]);
      if (showToast) showToast(`成功上传 ${newUrls.length} 张照片`, 'success');
    } catch (err) {
      if (showToast) showToast('部分图片上传失败', 'error');
    } finally {
      setUploadingAlbum(false);
      if (albumInputRef.current) albumInputRef.current.value = '';
    }
  };

  const removeAlbumItem = (index: number) => {
    setAlbum(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, age: parseInt(age) || null, location, job, about, avatar: avatarUrl, main_image: mainImage, album })
      });

      if (res.ok) {
        const data = await res.json();
        onSave(data);
      } else {
        const err = await res.json().catch(() => ({}));
        const errMsg = err.error || '保存资料失败';
        if (showToast) showToast(errMsg, 'error');
        else alert(errMsg);
      }
    } catch (e) {
      console.error('Error saving profile:', e);
      if (showToast) showToast('网络错误，请重试', 'error');
      else alert('网络错误，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:w-[420px] max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <h3 className="text-xl font-bold">编辑个人资料</h3>
          <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex flex-col items-center">
            <div 
              className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 relative group cursor-pointer shadow-sm border-2 border-white" 
              onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold">
                  {name?.[0] || '?'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
              </div>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAvatarSelect} disabled={uploadingAvatar} />
            <p className="text-xs text-gray-400 mt-2">点击更换头像</p>
          </div>

          {/* Main Background Image */}
          <div>
            <label className="text-sm font-medium text-gray-500 mb-2 block">个人主页背景大图</label>
            <div 
              className="w-full h-40 bg-gray-50 rounded-2xl overflow-hidden relative cursor-pointer group border border-gray-100 shadow-sm"
              onClick={() => !uploadingMain && mainImageInputRef.current?.click()}
            >
              {mainImage ? (
                <img src={mainImage} alt="Main Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ImagePlus className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">上传背景图</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingMain ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <span className="text-white font-medium">点击更换背景图</span>}
              </div>
            </div>
            <input type="file" accept="image/*" ref={mainImageInputRef} className="hidden" onChange={handleMainImageSelect} disabled={uploadingMain} />
          </div>

          {/* Album */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-500 block">相册墙照片 ({album.length}/9)</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {album.map((url, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden relative group bg-gray-100 border border-gray-100">
                  <img src={url} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeAlbumItem(i)}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {album.length < 9 && (
                <div 
                  className="aspect-[3/4] rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => !uploadingAlbum && albumInputRef.current?.click()}
                >
                  {uploadingAlbum ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <div className="flex flex-col items-center"><span className="text-2xl text-gray-400 mb-1">+</span><span className="text-[10px] text-gray-400">上传</span></div>}
                </div>
              )}
            </div>
            <input type="file" accept="image/*" multiple ref={albumInputRef} className="hidden" onChange={handleAlbumSelect} disabled={uploadingAlbum} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 mb-1 block">姓名</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 mb-1 block">年龄</label>
            <input value={age} onChange={e => setAge(e.target.value)} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 mb-1 block">地点</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 mb-1 block">职业</label>
            <input value={job} onChange={e => setJob(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 mb-1 block">个人简介</label>
            <textarea value={about} onChange={e => setAbout(e.target.value)} rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
          </div>
        </div>
        <div className="p-6 pt-0">
          <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-full bg-gradient-to-br from-primary to-primary-light text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50">
            {saving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  );
}
