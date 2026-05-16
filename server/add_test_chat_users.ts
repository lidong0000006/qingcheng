import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY. Please set them in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestUsers() {
  console.log('Adding test users for chat...');

  // 1. Get the main profile user
  const { data: mainProfile, error: mainError } = await supabase
    .from('users')
    .select('id')
    .eq('is_main_profile', true)
    .single();

  if (mainError || !mainProfile) {
    console.error('❌ Error fetching main profile. Please run "npm run seed" first.', mainError?.message);
    return;
  }

  // 2. Define 2 test users
  const testUsers = [
    {
      name: '小柔 (Test)',
      age: 22,
      location: '上海 浦东',
      job: '原画师',
      about: '你好呀！我正在测试聊天功能。我喜欢绘画和ACG文化，希望能和你交流！',
      tags: ['二次元', '手办', '画师'],
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2487&auto=format&fit=crop',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2487&auto=format&fit=crop',
      is_main_profile: false
    },
    {
      name: '大海 (Test)',
      age: 28,
      location: '深圳 南山',
      job: '运动教练',
      about: '哈喽！我是大海，一个爱运动的人。想要测试一下消息回复速度吗？',
      tags: ['健身', '冲浪', '摄影'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2487&auto=format&fit=crop',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2487&auto=format&fit=crop',
      is_main_profile: false
    }
  ];

  // 3. Insert test users
  const { data: insertedUsers, error: insertError } = await supabase
    .from('users')
    .insert(testUsers)
    .select();

  if (insertError) {
    console.error('❌ Error inserting test users:', insertError.message);
    return;
  }

  // 4. Send initial messages to main profile
  const messages = insertedUsers.map(user => ({
    sender_id: user.id,
    receiver_id: mainProfile.id,
    message: `你好！我是${user.name.split(' ')[0]}，希望能和你一起测试这个聊天功能哦！`,
    time_display: '刚刚',
    unread_count: 1,
    is_read: false
  }));

  const { error: msgError } = await supabase
    .from('messages')
    .insert(messages);

  if (msgError) {
    console.error('❌ Error inserting test messages:', msgError.message);
    return;
  }

  console.log('✅ Test users and initial messages added successfully!');
}

addTestUsers().catch(console.error);
