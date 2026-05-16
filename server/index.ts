import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { fetch as undiciFetch, ProxyAgent } from 'undici';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for file uploads (memory storage → forward to Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Missing SUPABASE_URL or SUPABASE_KEY in .env');
}

// Ensure the proxy is used for Supabase API requests to fix fetch failed.
let customFetch = undefined;
if (process.env.USE_LOCAL_PROXY === 'true') {
  const proxyUrl = process.env.PROXY_URL || 'http://127.0.0.1:7890';
  console.log(`🌐 Using local proxy: ${proxyUrl}`);
  try {
    const dispatcher = new ProxyAgent(proxyUrl);
    customFetch = (url: any, options: any) => {
      return undiciFetch(url, { ...options, dispatcher });
    };
  } catch(e) {
    console.error('❌ Failed to setup proxy:', e);
  }
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
  global: {
    fetch: (customFetch || fetch) as any
  }
});


// ========================
// DISCOVER
// ========================

// GET /api/discover - Fetch random users for discover page
app.get('/api/discover', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_main_profile', false);
  
  if (error) {
    console.error('Error fetching discover users:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// ========================
// PROFILE
// ========================

// GET /api/profile - Fetch the main user profile
app.get('/api/profile', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_main_profile', true)
    .limit(1)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
       return res.status(404).json({ error: 'Profile not found' });
    }
    console.error('Error fetching main profile:', error);
    return res.status(500).json({ error: error.message });
  }
  
  res.json(data);
});

// PUT /api/profile - Update the main user profile
app.put('/api/profile', async (req, res) => {
  console.log('PUT /api/profile body:', req.body);
  const { name, age, location, job, about, pref_min_age, pref_max_age, pref_distance, avatar, main_image, album } = req.body;

  // First get the main profile id
  const { data: profile, error: fetchErr } = await supabase
    .from('users')
    .select('id')
    .eq('is_main_profile', true)
    .limit(1)
    .single();

  if (fetchErr || !profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (age !== undefined) updates.age = age;
  if (location !== undefined) updates.location = location;
  if (job !== undefined) updates.job = job;
  if (about !== undefined) updates.about = about;
  if (pref_min_age !== undefined) updates.pref_min_age = pref_min_age;
  if (pref_max_age !== undefined) updates.pref_max_age = pref_max_age;
  if (pref_distance !== undefined) updates.pref_distance = pref_distance;
  if (avatar !== undefined) updates.avatar = avatar;
  if (main_image !== undefined) updates.main_image = main_image;
  if (album !== undefined) updates.album = album;

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', profile.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: error.message });
  }

  console.log('Update successful:', data);
  res.json(data);
});

// ========================
// MESSAGES
// ========================

// GET /api/messages - Fetch message list (conversations)
app.get('/api/messages', async (req, res) => {
  // 1. Get the current main user
  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('id')
    .eq('is_main_profile', true)
    .limit(1)
    .single();

  if (profileErr || !profile) {
    return res.status(404).json({ error: 'Main profile not found' });
  }

  const myId = profile.id;

  // 2. Fetch all messages involving the user
  const { data: allMessages, error: msgsErr } = await supabase
    .from('messages')
    .select(`
      id,
      message,
      time_display,
      is_read,
      created_at,
      sender_id,
      receiver_id,
      sender:sender_id (id, name, avatar),
      receiver:receiver_id (id, name, avatar)
    `)
    .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
    .order('created_at', { ascending: false });

  if (msgsErr) {
    console.error('Error fetching messages:', msgsErr);
    return res.status(500).json({ error: msgsErr.message });
  }

  // 3. Group by conversation (the other user)
  const conversationsMap = new Map<string, any>();

  for (const msg of allMessages) {
    const partner = (msg.sender_id === myId ? msg.receiver : msg.sender) as any;
    if (!partner) continue;
    const partnerId = partner.id;

    if (!conversationsMap.has(partnerId)) {
      conversationsMap.set(partnerId, {
        id: msg.id,
        name: partner.name,
        avatar: partner.avatar,
        message: msg.message,
        time: msg.time_display,
        unread: 0,
        read: msg.sender_id === myId ? true : msg.is_read,
        sender_id: partnerId, // partner as sender for Frontend mapping
        receiver_id: myId,
        last_timestamp: new Date(msg.created_at).getTime()
      });
    }

    // Count unread messages *sent to me*
    if (msg.receiver_id === myId && !msg.is_read) {
      conversationsMap.get(partnerId).unread += 1;
    }
  }

  const result = Array.from(conversationsMap.values()).sort((a, b) => b.last_timestamp - a.last_timestamp);
  res.json(result);
});

// GET /api/messages/chat/:partnerId - Get chat messages with a specific user
app.get('/api/messages/chat/:partnerId', async (req, res) => {
  const { partnerId } = req.params;

  // Get main profile
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('is_main_profile', true)
    .limit(1)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const myId = profile.id;

  // Get all messages between me and partner
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      message,
      time_display,
      is_read,
      created_at,
      sender_id,
      receiver_id
    `)
    .or(`and(sender_id.eq.${myId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${myId})`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat:', error);
    return res.status(500).json({ error: error.message });
  }

  // Mark messages from partner as read
  await supabase
    .from('messages')
    .update({ is_read: true, unread_count: 0 })
    .eq('sender_id', partnerId)
    .eq('receiver_id', myId);

  const formattedData = (data || []).map((msg: any) => ({
    id: msg.id,
    message: msg.message,
    time: msg.time_display || '',
    is_mine: msg.sender_id === myId,
    created_at: msg.created_at
  }));

  res.json(formattedData);
});

// POST /api/messages - Send a new message
app.post('/api/messages', async (req, res) => {
  const { receiver_id, message } = req.body;

  if (!receiver_id || !message) {
    return res.status(400).json({ error: 'receiver_id and message are required' });
  }

  // Get main profile
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('is_main_profile', true)
    .limit(1)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const now = new Date();
  const timeDisplay = '刚刚';

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      sender_id: profile.id,
      receiver_id,
      message,
      time_display: timeDisplay,
      unread_count: 0,
      is_read: false
    }])
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ...data, is_mine: true });
});

// ========================
// LIKES
// ========================

// GET /api/likes - Get all likes for main user
app.get('/api/likes', async (req, res) => {
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('is_main_profile', true)
    .limit(1)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const { data, error } = await supabase
    .from('likes')
    .select('liked_id')
    .eq('liker_id', profile.id);

  if (error) {
    console.error('Error fetching likes:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json((data || []).map((l: any) => l.liked_id));
});

// POST /api/likes - Like a user
app.post('/api/likes', async (req, res) => {
  const { liked_id } = req.body;

  if (!liked_id) {
    return res.status(400).json({ error: 'liked_id is required' });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('is_main_profile', true)
    .limit(1)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const { data, error } = await supabase
    .from('likes')
    .insert([{ liker_id: profile.id, liked_id }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Already liked' });
    }
    console.error('Error liking user:', error);
    return res.status(500).json({ error: error.message });
  }

  // Create notification for the liked user
  await supabase.from('notifications').insert([{
    user_id: liked_id,
    type: 'like',
    content: `${profile.id} 喜欢了你`,
    related_user_id: profile.id
  }]);

  res.json(data);
});

// DELETE /api/likes/:likedId - Unlike a user
app.delete('/api/likes/:likedId', async (req, res) => {
  const { likedId } = req.params;

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('is_main_profile', true)
    .limit(1)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('liker_id', profile.id)
    .eq('liked_id', likedId);

  if (error) {
    console.error('Error unliking user:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

// ========================
// MATCHES/LIKES DETAILS
// ========================

// GET /api/matches/all - Get details of users I liked and users who liked me
app.get('/api/matches/all', async (req, res) => {
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('is_main_profile', true)
    .limit(1)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const myId = profile.id;

  // 1. Fetch users I liked
  const { data: likedByMe, error: err1 } = await supabase
    .from('likes')
    .select(`
      created_at,
      liked_user:users!liked_id (id, name, age, location, distance, image, avatar, job)
    `)
    .eq('liker_id', myId)
    .order('created_at', { ascending: false });

  // 2. Fetch users who liked me
  const { data: likedMe, error: err2 } = await supabase
    .from('likes')
    .select(`
      created_at,
      liker_user:users!liker_id (id, name, age, location, distance, image, avatar, job)
    `)
    .eq('liked_id', myId)
    .order('created_at', { ascending: false });

  if (err1 || err2) {
    console.error('Error fetching matches details:', err1 || err2);
    return res.status(500).json({ error: (err1 || err2)?.message });
  }

  const result = {
    liked_by_me: (likedByMe || [])
      .filter((l: any) => l.liked_user)
      .map((l: any) => {
        const user = Array.isArray(l.liked_user) ? l.liked_user[0] : l.liked_user;
        return {
          ...user,
          liked_at: l.created_at
        };
      }),
    liked_me: (likedMe || [])
      .filter((l: any) => l.liker_user)
      .map((l: any) => {
        const user = Array.isArray(l.liker_user) ? l.liker_user[0] : l.liker_user;
        return {
          ...user,
          liked_at: l.created_at
        };
      })
  };

  res.json(result);
});


// ========================
// NOTIFICATIONS
// ========================

// GET /api/notifications - Fetch notifications for main user
app.get('/api/notifications', async (req, res) => {
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('is_main_profile', true)
    .limit(1)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id,
      type,
      content,
      is_read,
      created_at,
      related_user:related_user_id (
        id,
        name,
        avatar
      )
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data || []);
});

// PUT /api/notifications/read-all - Mark all notifications as read
app.put('/api/notifications/read-all', async (req, res) => {
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('is_main_profile', true)
    .limit(1)
    .single();

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', profile.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking notifications read:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

// ========================
// ALL USERS (for contact picker & dev switching)
// ========================

app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, avatar, is_main_profile')
    // No filter to allow picking anyone including main profile
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data || []);
});

// ========================
// DEV: Switch Identity
// ========================
app.post('/api/dev/switch-user', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  // 1. Reset all main profile flags
  await supabase
    .from('users')
    .update({ is_main_profile: false })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Just to avoid empty update

  // 2. Set the new one
  const { data, error } = await supabase
    .from('users')
    .update({ is_main_profile: true })
    .eq('id', user_id)
    .select()
    .single();

  if (error) {
    console.error('Error switching user:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true, user: data });
});

// ========================
// FILE UPLOAD (通过后端代理上传到 Supabase Storage)
// ========================

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filename, file.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.mimetype,
      });

    if (error || !data) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: error?.message || 'Upload failed' });
    }

    const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(data.path);
    res.json({ url: urlData.publicUrl });
  } catch (err: any) {
    console.error('Upload endpoint error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// ========================
// MOMENTS (动态)
// ========================

// Helper: get main user id
async function getMainUserId() {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('is_main_profile', true)
    .limit(1)
    .single();
  if (error || !data) return null;
  return data.id as string;
}

// GET /api/posts - Paginated feed
app.get('/api/posts', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(20, parseInt(req.query.limit as string) || 10);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const myId = await getMainUserId();

  // Try fetching with videos column; fall back without it if column doesn't exist yet
  let posts: any = null;
  let hasVideosCol = true;

  let { data: postsData, error } = await supabase
    .from('posts')
    .select(`id, content, images, videos, created_at, author:user_id (id, name, avatar)`)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error && (error.message?.includes('videos') || error.code === '42703')) {
    // videos column missing — retry without it
    hasVideosCol = false;
    console.warn('videos column not found, retrying without it');
    const fallback = await supabase
      .from('posts')
      .select(`id, content, images, created_at, author:user_id (id, name, avatar)`)
      .order('created_at', { ascending: false })
      .range(from, to);
    (postsData as any) = fallback.data;
    (error as any) = fallback.error;
  }

  if (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ error: error.message });
  }

  posts = postsData;
  if (!posts || posts.length === 0) return res.json([]);

  const postIds = posts.map((p: any) => p.id);

  // Fetch like counts per post
  const { data: likeCounts } = await supabase
    .from('post_likes')
    .select('post_id')
    .in('post_id', postIds);

  // Fetch which posts current user liked
  const { data: myLikes } = myId
    ? await supabase.from('post_likes').select('post_id').in('post_id', postIds).eq('user_id', myId)
    : { data: [] };

  // Fetch comment counts
  const { data: commentCounts } = await supabase
    .from('post_comments')
    .select('post_id')
    .in('post_id', postIds);

  const likeCountMap: Record<string, number> = {};
  const myLikeSet = new Set<string>((myLikes || []).map((l: any) => l.post_id));
  const commentCountMap: Record<string, number> = {};

  for (const l of likeCounts || []) {
    likeCountMap[l.post_id] = (likeCountMap[l.post_id] || 0) + 1;
  }
  for (const c of commentCounts || []) {
    commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1;
  }

  const result = posts.map((p: any) => ({
    id: p.id,
    content: p.content,
    images: p.images,
    videos: hasVideosCol ? p.videos : undefined,
    created_at: p.created_at,
    author: p.author,
    like_count: likeCountMap[p.id] || 0,
    comment_count: commentCountMap[p.id] || 0,
    is_liked: myLikeSet.has(p.id),
  }));

  res.json(result);
});

// POST /api/posts - Create a new post
app.post('/api/posts', async (req, res) => {
  const { content, images, videos } = req.body;
  const safeContent = content ? content.trim() : '';
  const hasImages = Array.isArray(images) && images.length > 0;
  const hasVideos = Array.isArray(videos) && videos.length > 0;
  if (!safeContent && !hasImages && !hasVideos) {
    return res.status(400).json({ error: 'content, images or videos is required' });
  }

  const myId = await getMainUserId();
  if (!myId) return res.status(404).json({ error: 'Main profile not found' });

  // Try insert with videos; fall back without if column missing
  let { data, error } = await supabase
    .from('posts')
    .insert([{ user_id: myId, content: safeContent, images: images || null, videos: videos || null }])
    .select(`id, content, images, videos, created_at, author:user_id (id, name, avatar)`)
    .single();

  if (error && (error.message?.includes('videos') || error.code === '42703')) {
    console.warn('videos column not found, inserting without it');
    ({ data, error } = await supabase
      .from('posts')
      .insert([{ user_id: myId, content: safeContent, images: images || null }])
      .select(`id, content, images, created_at, author:user_id (id, name, avatar)`)
      .single());
  }

  if (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ ...data, videos: videos || undefined, like_count: 0, comment_count: 0, is_liked: false });
});

// POST /api/posts/:postId/likes - Toggle like
app.post('/api/posts/:postId/likes', async (req, res) => {
  const { postId } = req.params;
  const myId = await getMainUserId();
  if (!myId) return res.status(404).json({ error: 'Main profile not found' });

  const { data, error } = await supabase
    .from('post_likes')
    .insert([{ post_id: postId, user_id: myId }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Already liked' });
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// DELETE /api/posts/:postId/likes - Unlike
app.delete('/api/posts/:postId/likes', async (req, res) => {
  const { postId } = req.params;
  const myId = await getMainUserId();
  if (!myId) return res.status(404).json({ error: 'Main profile not found' });

  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', myId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// GET /api/posts/:postId/comments - Get comments for a post
app.get('/api/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;

  const { data, error } = await supabase
    .from('post_comments')
    .select(`
      id,
      content,
      created_at,
      user_id,
      author:user_id (id, name, avatar)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// POST /api/posts/:postId/comments - Add a comment
app.post('/api/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'content is required' });
  }

  const myId = await getMainUserId();
  if (!myId) return res.status(404).json({ error: 'Main profile not found' });

  const { data, error } = await supabase
    .from('post_comments')
    .insert([{ post_id: postId, user_id: myId, content: content.trim() }])
    .select(`
      id,
      content,
      created_at,
      user_id,
      author:user_id (id, name, avatar)
    `)
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = Number(process.env.PORT) || 3001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server is running on http://0.0.0.0:${PORT}`);
  });
}
