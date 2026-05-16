-- 1. Create the `users` table
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

-- 2. Create the `messages` table
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

-- 3. Create the `likes` table
CREATE TABLE IF NOT EXISTS likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  liker_id uuid REFERENCES users(id) ON DELETE CASCADE,
  liked_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(liker_id, liked_id)
);

-- 4. Create the `notifications` table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  content text NOT NULL,
  related_user_id uuid REFERENCES users(id),
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Setup row level security (RLS) policies
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow public read access on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read access on messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public read access on likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on notifications" ON notifications FOR SELECT USING (true);

-- Allow backend service to insert, update and delete
CREATE POLICY "Allow full access to users anon" ON users FOR ALL USING (true);
CREATE POLICY "Allow full access to messages anon" ON messages FOR ALL USING (true);
CREATE POLICY "Allow full access to likes anon" ON likes FOR ALL USING (true);
CREATE POLICY "Allow full access to notifications anon" ON notifications FOR ALL USING (true);
