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

async function checkLikes() {
    try {
        const { data: users } = await supabase.from('users').select('id, name, is_main_profile');
        const mainUser = users?.find(u => u.is_main_profile);
        console.log('Main User ID:', mainUser?.id);

        const { data: allLikes } = await supabase.from('likes').select('*');
        console.log('Total Likes in DB:', allLikes?.length);
        console.log('Sample Like:', allLikes?.[0]);

        if (mainUser) {
            const { data: likedByMe, error: err1 } = await supabase
                .from('likes')
                .select(`
                    created_at,
                    target:liked_id (id, name)
                `)
                .eq('liker_id', mainUser.id);
            
            console.log('Liked By Me (with alias):', JSON.stringify(likedByMe, null, 2));
            
            const { data: likedMe, error: err2 } = await supabase
                .from('likes')
                .select(`
                    created_at,
                    liker:liker_id (id, name)
                `)
                .eq('liked_id', mainUser.id);
                
            console.log('Liked Me (with alias):', JSON.stringify(likedMe, null, 2));
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

checkLikes();
