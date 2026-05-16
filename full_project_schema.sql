-- ==========================================
-- 倾城之恋 - 完整数据库初始化脚本
-- ==========================================

-- 1. 用户表 (Users)
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  age integer,
  distance text,
  location text,
  job text,
  about text,
  tags text[],
  image text,
  avatar text,
  main_image text,
  album text[],
  is_main_profile boolean DEFAULT false,
  auth_id uuid UNIQUE,
  pref_min_age integer DEFAULT 18,
  pref_max_age integer DEFAULT 50,
  pref_distance integer DEFAULT 30,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 聊天消息表 (Messages)
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES users(id),
  receiver_id uuid REFERENCES users(id),
  message text NOT NULL,
  time_display text,
  unread_count integer DEFAULT 0,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 用户匹配点赞表 (User Likes)
CREATE TABLE IF NOT EXISTS likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  liker_id uuid REFERENCES users(id) ON DELETE CASCADE,
  liked_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(liker_id, liked_id)
);

-- 4. 通知表 (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  content text NOT NULL,
  related_user_id uuid REFERENCES users(id),
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. 动态帖子表 (Moments Posts)
CREATE TABLE IF NOT EXISTS posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  images text[],
  videos text[], -- 视频支持列
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. 动态点赞 (Post Likes)
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- 7. 动态评论 (Post Comments)
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 安全策略配置 (RLS)
-- ==========================================

-- 开启所有表的 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- 允许匿名/公共完全访问 (开发环境下简便起见)
CREATE POLICY "Full access to users" ON users FOR ALL USING (true);
CREATE POLICY "Full access to messages" ON messages FOR ALL USING (true);
CREATE POLICY "Full access to likes" ON likes FOR ALL USING (true);
CREATE POLICY "Full access to notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Full access to posts" ON posts FOR ALL USING (true);
CREATE POLICY "Full access to post_likes" ON post_likes FOR ALL USING (true);
CREATE POLICY "Full access to post_comments" ON post_comments FOR ALL USING (true);

-- ==========================================
-- 存储桶初始化 (Supabase Storage)
-- ==========================================

-- 确保存储桶存在并公开
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 存储权限策略
DROP POLICY IF EXISTS "Allow anon uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon reads" ON storage.objects;

CREATE POLICY "Allow anon uploads"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Allow anon reads"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'post-images');
