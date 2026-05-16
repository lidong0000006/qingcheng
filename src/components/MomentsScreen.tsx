import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Send, X, ImagePlus, ChevronDown, Loader2, AlertCircle, Video } from 'lucide-react';
import { apiFetch } from '../lib/api';


// ─── Types ───────────────────────────────────────────────────────────────────
interface Author {
  id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  id: string;
  user_id: string;
  author: Author;
  content: string;
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  images?: string[];
  videos?: string[];
  created_at: string;
  author: Author;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  comments?: Comment[];
}

interface MomentsScreenProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  refreshKey?: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} 天前`;
  return new Date(iso).toLocaleDateString('zh-CN');
}

// Upload a single file via backend proxy (solves direct Supabase upload failures)
async function uploadMedia(file: File, showToast: MomentsScreenProps['showToast']): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch('/api/upload', {
      method: 'POST',
      body: formData,
    });


    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: '未知错误' }));
      console.error('Upload Error:', errData);
      showToast(`上传文件失败: ${errData.error || '未知错误'}`, 'error');
      return null;
    }

    const data = await res.json();
    return data.url;
  } catch (err: any) {
    console.error('Upload Error:', err);
    showToast(`上传文件失败: ${err.message || '网络错误'}`, 'error');
    return null;
  }
}

// ─── Image Preview Grid ───────────────────────────────────────────────────────
function ImagePreviewGrid({
  previews,
  onRemove,
  onAdd,
}: {
  previews: string[];
  onRemove: (i: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="compose-image-grid">
      {previews.map((url, i) => (
        <div key={i} className="compose-image-preview-wrap">
          <img src={url} alt="" className="compose-image-preview-img" />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="compose-image-remove-btn"
            aria-label="移除图片"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      {previews.length < 9 && (
        <button
          type="button"
          onClick={onAdd}
          className="compose-image-add-btn"
          aria-label="添加图片"
        >
          <ImagePlus className="w-6 h-6 text-gray-400" />
          <span className="compose-image-add-label">{previews.length}/9</span>
        </button>
      )}
    </div>
  );
}

// ─── Compose Box ──────────────────────────────────────────────────────────────
function ComposeBox({ onPosted, showToast }: {
  onPosted: () => void;
  showToast: MomentsScreenProps['showToast'];
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleClose = () => {
    setOpen(false);
    setText('');
    // Revoke all preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadProgress('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []) as File[];
    const isAddingVideo = files.some(f => f.type.startsWith('video/'));

    if (isAddingVideo) {
      if (selectedFiles.length > 0 || files.length > 1) {
        showToast('视频只能单独上传一个，且不能与图片混合', 'info');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      const vFile = files[0];
      if (vFile.size > 50 * 1024 * 1024) { // 50MB
        showToast('视频大小不能超过 50MB', 'info');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      const previewUrl = URL.createObjectURL(vFile);
      setSelectedFiles([vFile]);
      setPreviewUrls([previewUrl]);
    } else {
      if (selectedFiles.some(f => f.type.startsWith('video/'))) {
        showToast('不能与视频混合上传', 'info');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      const remaining = 9 - selectedFiles.length;
      const newFiles = files.slice(0, remaining);

      const validFiles = newFiles.filter((f: File) => f.type.startsWith('image/'));
      if (validFiles.length < newFiles.length) {
        showToast('只支持图片和视频文件', 'info');
      }
      const sizedFiles = validFiles.filter((f: File) => f.size <= 5 * 1024 * 1024);
      if (sizedFiles.length < validFiles.length) {
        showToast('单张图片不能超过 5MB', 'info');
      }

      if (sizedFiles.length === 0) return;

      const newPreviews = sizedFiles.map((f: File) => URL.createObjectURL(f));
      setSelectedFiles(prev => [...prev, ...sizedFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text.trim() && selectedFiles.length === 0) {
      showToast('请输入内容或选择图片/视频', 'error');
      return;
    }
    setSending(true);
    try {
      // Upload files if any
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setUploadProgress(`上传文件 0/${selectedFiles.length}...`);
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgress(`上传文件 ${i + 1}/${selectedFiles.length}...`);
          const url = await uploadMedia(selectedFiles[i], showToast);
          if (!url) {
            // uploadMedia already showed a specific error toast; abort the whole post
            setSending(false);
            setUploadProgress('');
            return;
          }
          if (selectedFiles[i].type.startsWith('video/')) {
            videoUrls.push(url);
          } else {
            imageUrls.push(url);
          }
        }
        setUploadProgress('发布动态中...');
      }

      const res = await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          content: text.trim(),
          images: imageUrls.length > 0 ? imageUrls : undefined,
          videos: videoUrls.length > 0 ? videoUrls : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: '未知错误' }));
        throw new Error(errData.error || '发布失败');
      }
      handleClose();
      showToast('动态已发布 ✨', 'success');
      onPosted();
    } catch (err: any) {
      showToast(`发布失败：${err.message || '请重试'}`, 'error');
    } finally {
      setSending(false);
      setUploadProgress('');
    }
  };

  if (!open) {
    return (
      <button onClick={handleOpen} id="compose-post-btn" className="moments-compose-trigger">
        <div className="moments-compose-avatar-placeholder" />
        <span>分享此刻的心情...</span>
        <ImagePlus className="moments-compose-img-icon" />
      </button>
    );
  }

  return (
    <div className="moments-compose-box">
      {/* Header */}
      <div className="moments-compose-header">
        <span className="moments-compose-title">发布动态</span>
        <button onClick={handleClose} className="moments-compose-close" disabled={sending}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Text area */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="写点什么吧，让大家了解你的精彩生活..."
        className="moments-compose-textarea"
        maxLength={500}
        rows={4}
        disabled={sending}
      />

      {/* Media previews */}
      {previewUrls.length > 0 && selectedFiles[0]?.type.startsWith('video/') ? (
        <div className="compose-video-preview-wrap" style={{ position: 'relative', marginBottom: '12px' }}>
          <video src={previewUrls[0]} controls style={{ maxHeight: '200px', borderRadius: '8px', width: '100%', backgroundColor: '#000' }} />
          <button type="button" onClick={() => handleRemoveImage(0)} className="compose-image-remove-btn" style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '50%', padding: '4px', border: 'none', cursor: 'pointer' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : previewUrls.length > 0 ? (
        <ImagePreviewGrid
          previews={previewUrls}
          onRemove={handleRemoveImage}
          onAdd={() => fileInputRef.current?.click()}
        />
      ) : null}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/quicktime,video/webm"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={sending}
      />

      {/* Footer */}
      <div className="moments-compose-footer">
        <div className="compose-footer-left">
          {/* Media picker button */}
          {previewUrls.length < 9 && !selectedFiles.some(f => f.type.startsWith('video/')) && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="compose-add-image-btn"
              disabled={sending}
              title="添加图片或视频"
              style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
            >
              <ImagePlus className="w-5 h-5" />
              {previewUrls.length === 0 && <Video className="w-5 h-5 text-gray-400" />}
              {previewUrls.length > 0 && (
                <span className="compose-image-count-badge">{previewUrls.length}</span>
              )}
            </button>
          )}
          {uploadProgress && (
            <span className="compose-upload-progress">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {uploadProgress}
            </span>
          )}
        </div>
        <div className="compose-footer-right">
          <span className="moments-char-count">{text.length}/500</span>
          <button
            onClick={handleSubmit}
            disabled={sending || (!text.trim() && selectedFiles.length === 0)}
            id="submit-post-btn"
            className="moments-submit-btn"
          >
            {sending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {uploadProgress || '发布中...'}</>
              : <><Send className="w-4 h-4" /> 发布</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Comment Section ──────────────────────────────────────────────────────────
function CommentSection({ postId, comments, onNewComment, showToast }: {
  postId: string;
  comments: Comment[];
  onNewComment: (comment: Comment) => void;
  showToast: MomentsScreenProps['showToast'];
}) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const res = await apiFetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: input.trim() }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      onNewComment(data);
      setInput('');
      showToast('评论成功 💬', 'success');
    } catch {
      showToast('评论失败，请重试', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="moments-comments">
      {comments.map(c => (
        <div key={c.id} className="moments-comment-item">
          <div className="moments-comment-avatar">
            {c.author.avatar
              ? <img src={c.author.avatar} alt={c.author.name} className="w-full h-full object-cover rounded-full" />
              : <span className="moments-avatar-initial">{c.author.name?.[0]}</span>}
          </div>
          <div className="moments-comment-body">
            <span className="moments-comment-author">{c.author.name}</span>
            <span className="moments-comment-text">{c.content}</span>
            <span className="moments-comment-time">{timeAgo(c.created_at)}</span>
          </div>
        </div>
      ))}
      <div className="moments-comment-input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="写评论..."
          className="moments-comment-input"
          maxLength={200}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="moments-comment-send-btn"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(c + 1, images.length - 1));
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(c - 1, 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}><X className="w-6 h-6" /></button>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <img src={images[current]} alt="" className="lightbox-img" />
      </div>
      {images.length > 1 && (
        <div className="lightbox-dots">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i); }}
              className={`lightbox-dot ${i === current ? 'lightbox-dot-active' : ''}`}
            />
          ))}
        </div>
      )}
      {current > 0 && (
        <button className="lightbox-nav lightbox-nav-prev" onClick={e => { e.stopPropagation(); setCurrent(c => c - 1); }}>‹</button>
      )}
      {current < images.length - 1 && (
        <button className="lightbox-nav lightbox-nav-next" onClick={e => { e.stopPropagation(); setCurrent(c => c + 1); }}>›</button>
      )}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, onLikeToggle, showToast }: {
  post: Post;
  onLikeToggle: (postId: string) => void;
  showToast: MomentsScreenProps['showToast'];
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleToggleComments = async () => {
    if (!showComments && !commentsLoaded) {
      try {
        const res = await apiFetch(`/api/posts/${post.id}/comments`);

        if (res.ok) {
          setComments(await res.json());
          setCommentsLoaded(true);
        }
      } catch {}
    }
    setShowComments(v => !v);
  };

  const handleNewComment = (comment: Comment) => {
    setComments(prev => [...prev, comment]);
    setCommentCount(c => c + 1);
  };

  const imgs = post.images || [];
  const gridClass = imgs.length === 1 ? 'moments-post-images-1'
    : imgs.length === 2 ? 'moments-post-images-2'
    : 'moments-post-images-3';

  return (
    <article className="moments-post-card">
      {lightboxIndex !== null && (
        <Lightbox images={imgs} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      {/* Author */}
      <div className="moments-post-author-row">
        <div className="moments-post-avatar">
          {post.author.avatar
            ? <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover rounded-2xl" />
            : <span className="moments-avatar-initial-lg">{post.author.name?.[0]}</span>}
        </div>
        <div className="moments-post-meta">
          <span className="moments-post-name">{post.author.name}</span>
          <span className="moments-post-time">{timeAgo(post.created_at)}</span>
        </div>
      </div>

      {/* Content */}
      {post.content && <p className="moments-post-content">{post.content}</p>}

      {/* Video */}
      {post.videos && post.videos.length > 0 && (
        <div className="moments-post-video-wrap" style={{ marginTop: '8px', marginBottom: '8px' }}>
          <video 
            src={post.videos[0]} 
            controls 
            className="moments-post-video" 
            style={{ maxHeight: '400px', width: '100%', borderRadius: '12px', backgroundColor: '#000' }} 
          />
        </div>
      )}

      {/* Images */}
      {imgs.length > 0 && (
        <div className={`moments-post-images ${gridClass}`}>
          {imgs.slice(0, 9).map((img, i) => (
            <div
              key={i}
              className="moments-post-image-wrap"
              onClick={() => setLightboxIndex(i)}
            >
              <img src={img} alt="" className="moments-post-img" />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="moments-post-actions">
        <button
          onClick={() => onLikeToggle(post.id)}
          className={`moments-action-btn ${post.is_liked ? 'moments-action-liked' : ''}`}
          id={`like-post-${post.id}`}
        >
          <Heart className={`w-5 h-5 transition-transform ${post.is_liked ? 'fill-current scale-110' : ''}`} />
          <span>{post.like_count > 0 ? post.like_count : '点赞'}</span>
        </button>

        <button
          onClick={handleToggleComments}
          className={`moments-action-btn ${showComments ? 'moments-action-active' : ''}`}
          id={`comment-post-${post.id}`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>{commentCount > 0 ? commentCount : '评论'}</span>
          {commentCount > 0 && (
            <ChevronDown className={`w-4 h-4 transition-transform ${showComments ? 'rotate-180' : ''}`} />
          )}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={comments}
          onNewComment={handleNewComment}
          showToast={showToast}
        />
      )}
    </article>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MomentsScreen({ showToast, refreshKey }: MomentsScreenProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [postVersion, setPostVersion] = useState(0);

  const fetchPosts = useCallback(async (pageNum: number, reset = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await apiFetch(`/api/posts?page=${pageNum}&limit=10`);

      if (!res.ok) throw new Error();
      const data: Post[] = await res.json();
      if (reset || pageNum === 1) setPosts(data);
      else setPosts(prev => [...prev, ...data]);
      setHasMore(data.length === 10);
    } catch {
      if (pageNum === 1) setPosts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts, refreshKey, postVersion]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  const handlePosted = () => setPostVersion(v => v + 1);

  const handleLikeToggle = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const wasLiked = post.is_liked;
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, is_liked: !wasLiked, like_count: wasLiked ? p.like_count - 1 : p.like_count + 1 }
        : p
    ));
    try {
      const res = await apiFetch(`/api/posts/${postId}/likes`, { method: wasLiked ? 'DELETE' : 'POST' });

      if (!res.ok) throw new Error();
      showToast(wasLiked ? '已取消点赞' : '已点赞 ❤️', wasLiked ? 'info' : 'success');
    } catch {
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, is_liked: wasLiked, like_count: wasLiked ? p.like_count + 1 : p.like_count - 1 }
          : p
      ));
      showToast('操作失败', 'error');
    }
  };

  return (
    <main className="moments-screen">
      <ComposeBox onPosted={handlePosted} showToast={showToast} />

      {loading ? (
        <div className="moments-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="moments-skeleton">
              <div className="moments-skeleton-avatar" />
              <div className="moments-skeleton-lines">
                <div className="moments-skeleton-line moments-skeleton-name" />
                <div className="moments-skeleton-line moments-skeleton-text" />
                <div className="moments-skeleton-line moments-skeleton-text-short" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="moments-empty">
          <div className="moments-empty-icon">🌸</div>
          <p className="moments-empty-text">还没有动态，来发布第一条吧～</p>
        </div>
      ) : (
        <>
          <div className="moments-feed">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLikeToggle={handleLikeToggle}
                showToast={showToast}
              />
            ))}
          </div>
          {hasMore && (
            <button onClick={handleLoadMore} disabled={loadingMore} className="moments-load-more">
              {loadingMore ? <><Loader2 className="w-4 h-4 animate-spin" /> 加载中...</> : '加载更多'}
            </button>
          )}
          {!hasMore && posts.length > 0 && (
            <p className="moments-end-hint">已经到底啦 ～ 🌸</p>
          )}
        </>
      )}
    </main>
  );
}
