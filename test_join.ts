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

async function testJoin() {
    try {
        const { data: profile } = await supabase.from('users').select('id').eq('is_main_profile', true).single();
        if (!profile) return;

        const { data, error } = await supabase
            .from('likes')
            .select(`
                created_at,
                liked_user:liked_id (id, name)
            `)
            .eq('liker_id', profile.id);
        
        console.log('QueryResult:', JSON.stringify(data, null, 2));
        if (error) console.error('QueryError:', error);
    } catch (err) {
        console.error('Err:', err);
    }
}

testJoin();
