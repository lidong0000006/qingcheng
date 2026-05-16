-- ============================================================
-- 修复 post-images 存储桶的 RLS 策略
-- 请在 Supabase 控制台 → SQL Editor 中运行此文件
-- ============================================================

-- 1. 确保 bucket 存在且为 public
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. 删除旧策略（避免冲突）
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads"   ON storage.objects;
DROP POLICY IF EXISTS "Allow anon uploads to post-images"  ON storage.objects;
DROP POLICY IF EXISTS "Allow anon reads from post-images"  ON storage.objects;
DROP POLICY IF EXISTS "Allow anon updates to post-images"  ON storage.objects;
DROP POLICY IF EXISTS "Allow anon deletes from post-images" ON storage.objects;

-- 3. 新建正确的策略（明确授予 anon 和 authenticated 角色）
CREATE POLICY "Allow anon uploads to post-images"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Allow anon reads from post-images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'post-images');

CREATE POLICY "Allow anon updates to post-images"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'post-images');

CREATE POLICY "Allow anon deletes from post-images"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'post-images');
