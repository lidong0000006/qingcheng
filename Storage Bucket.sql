-- 创建公开图片存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- 允许任何人上传
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'post-images');

-- 允许任何人读取
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');


