-- 聊天测试数据初始化脚本
-- 请将此脚本复制并粘贴到 Supabase 的 SQL Editor 中执行。
-- 它会清理以前的测试数据，并生成两个新的测试用户（小雨 和 阿明）及他们的聊天对话。

-- 1. 清理旧的测试数据
DELETE FROM messages WHERE sender_id IN (SELECT id FROM users WHERE name LIKE '%[测试A]%' OR name LIKE '%[测试B]%');
DELETE FROM messages WHERE receiver_id IN (SELECT id FROM users WHERE name LIKE '%[测试A]%' OR name LIKE '%[测试B]%');
DELETE FROM users WHERE name LIKE '%[测试A]%' OR name LIKE '%[测试B]%';

-- 2. 重置所有用户的 is_main_profile 标志（防止混淆）
UPDATE users SET is_main_profile = false;

-- 3. 插入测试用户
-- 重新插入后，这两个用户的新 ID 会被生成
INSERT INTO users (id, name, age, location, job, about, tags, avatar, image, is_main_profile)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111', 
    '小雨 [测试A]', 
    24, 
    '上海 静安', 
    '插画师', 
    '爱画画、爱猫、爱旅行。正在测试聊天功能！', 
    ARRAY['插画', '咖啡', '猫咪'], 
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop', 
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop', 
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    '阿明 [测试B]', 
    27, 
    '上海 浦东', 
    '软件工程师', 
    '码农一枚，周末骑行。测试完记得给我发消息！', 
    ARRAY['骑行', '科技', '美食'], 
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop', 
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop', 
    false
  );

-- 4. 插入他们的对话消息历史
INSERT INTO messages (sender_id, receiver_id, message, time_display, unread_count, is_read, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '你好！我是小雨，看到你的资料感觉很有意思～', '16分钟前', 0, true, now() - interval '16 minutes'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '你好小雨！我是阿明，你平时都画什么类型的插画？', '14分钟前', 0, true, now() - interval '14 minutes'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '我喜欢画日系风格的治愈系插画，还有一些城市写生 🎨', '12分钟前', 0, true, now() - interval '12 minutes'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '哇很棒！骑行的时候能遇到很多风景，或许可以作为素材', '10分钟前', 0, true, now() - interval '10 minutes'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '对啊！下次骑行能带我一起吗 😄', '8分钟前', 0, true, now() - interval '8 minutes'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '当然！上海滨江那条路特别美', '6分钟前', 0, true, now() - interval '6 minutes'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '好期待！你一般什么时候有时间呀？', '4分钟前', 0, true, now() - interval '4 minutes'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '周末一般都有空，可以约个时间～ 现在可以回复我哦！', '刚刚', 0, false, now());

-- 执行完毕后，用户 "小雨 [测试A]" 将作为默认账户 (is_main_profile=true)
