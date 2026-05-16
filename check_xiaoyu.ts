import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetch as undiciFetch, ProxyAgent } from 'undici';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let customFetch = undefined;
try {
  const dispatcher = new ProxyAgent('http://127.0.0.1:7890');
  customFetch = (url: any, options: any) => {
    return undiciFetch(url, { ...options, dispatcher });
  };
} catch(e) {}

const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  global: {
    fetch: customFetch as any
  }
});

async function checkXiaoyu() {
    try {
        // 1. Find user named "小雨"
        const { data: users } = await supabase.from('users').select('*').ilike('name', '%小雨%');
        console.log('Users matching "小雨":', JSON.stringify(users, null, 2));

        // 2. Find who is the main profile
        const { data: mainProfile } = await supabase.from('users').select('id, name').eq('is_main_profile', true).single();
        console.log('Active Main Profile:', mainProfile);

        if (mainProfile && users && users.length > 0) {
            const xiaoyuId = users[0].id;
            // 3. Check if main profile likes Xiaoyu
            const { data: likeRecord } = await supabase.from('likes').select('*').eq('liker_id', mainProfile.id).eq('liked_id', xiaoyuId);
            console.log('Like record from main profile to 小雨:', likeRecord);
        }
        
        // 4. List all likes involving main profile
        if (mainProfile) {
            const { data: allRels } = await supabase.from('likes').select('*').or(`liker_id.eq.${mainProfile.id},liked_id.eq.${mainProfile.id}`);
            console.log('All likes involving main profile:', allRels);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

checkXiaoyu();
