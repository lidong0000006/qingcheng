/**
 * 聊天功能测试数据生成脚本（代理版）
 * 使用 Node.js 原生 https + 系统代理 访问 Supabase REST API
 */

import * as https from 'https';
import * as http from 'http';
import * as net from 'net';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Proxy config — Clash 通常监听 7891 (HTTP 代理) 或 7890 (混合)
const PROXY_HOST = '127.0.0.1';
const PROXY_PORT = 7891;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

// Build CONNECT tunnel through HTTP proxy for HTTPS
function makeRequest(method: string, path: string, body?: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const targetHost = SUPABASE_URL.replace('https://', '');
    const targetPort = 443;

    // Step 1: CONNECT to proxy
    const socket = net.connect(PROXY_PORT, PROXY_HOST, () => {
      socket.write(`CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\nHost: ${targetHost}:${targetPort}\r\n\r\n`);
    });

    socket.once('data', (data) => {
      const response = data.toString();
      if (!response.includes('200')) {
        reject(new Error(`Proxy CONNECT failed: ${response.split('\r\n')[0]}`));
        socket.destroy();
        return;
      }

      // Step 2: Wrap socket in TLS
      const tlsSocket = require('tls').connect({ socket, servername: targetHost, rejectUnauthorized: false });

      const headers = [
        `${method} ${path} HTTP/1.1`,
        `Host: ${targetHost}`,
        `apikey: ${SUPABASE_KEY}`,
        `Authorization: Bearer ${SUPABASE_KEY}`,
        'Content-Type: application/json',
        'Prefer: return=representation',
        'Connection: close',
      ];

      let bodyStr = '';
      if (body) {
        bodyStr = JSON.stringify(body);
        headers.push(`Content-Length: ${Buffer.byteLength(bodyStr)}`);
      } else {
        headers.push('Content-Length: 0');
      }

      tlsSocket.write(headers.join('\r\n') + '\r\n\r\n');
      if (bodyStr) tlsSocket.write(bodyStr);

      let rawData = '';
      tlsSocket.on('data', (chunk: Buffer) => { rawData += chunk.toString(); });
      tlsSocket.on('end', () => {
        const parts = rawData.split('\r\n\r\n');
        const headerLines = parts[0].split('\r\n');
        const statusLine = headerLines[0];
        const statusCode = parseInt(statusLine.split(' ')[1]);
        let responseBody = parts.slice(1).join('\r\n\r\n').trim();

        // Handle chunked transfer encoding
        if (headerLines.some(h => h.toLowerCase().includes('transfer-encoding: chunked'))) {
          const chunks: string[] = [];
          let rest = responseBody;
          while (rest.length > 0) {
            const newlineIdx = rest.indexOf('\r\n');
            if (newlineIdx === -1) break;
            const chunkSize = parseInt(rest.substring(0, newlineIdx), 16);
            if (isNaN(chunkSize) || chunkSize === 0) break;
            chunks.push(rest.substring(newlineIdx + 2, newlineIdx + 2 + chunkSize));
            rest = rest.substring(newlineIdx + 2 + chunkSize + 2);
          }
          responseBody = chunks.join('');
        }

        try {
          resolve(JSON.parse(responseBody || '[]'));
        } catch {
          resolve(responseBody);
        }
      });
      tlsSocket.on('error', reject);
    });

    socket.on('error', reject);
  });
}

async function sbSelect(table: string, query: string): Promise<any[]> {
  return makeRequest('GET', `/rest/v1/${table}?${query}`, undefined) as Promise<any[]>;
}

async function sbInsert(table: string, rows: any[]): Promise<any[]> {
  return makeRequest('POST', `/rest/v1/${table}`, rows) as Promise<any[]>;
}

async function sbPatch(table: string, query: string, update: object): Promise<any> {
  return makeRequest('PATCH', `/rest/v1/${table}?${query}`, update);
}

async function sbDelete(table: string, query: string): Promise<any> {
  return makeRequest('DELETE', `/rest/v1/${table}?${query}`, undefined);
}

const USER_A = {
  name: '小雨 [测试A]',
  age: 24,
  location: '上海 静安',
  job: '插画师',
  about: '爱画画、爱猫、爱旅行。正在测试聊天功能！',
  tags: ['插画', '咖啡', '猫咪'],
  avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop',
  image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=800&auto=format&fit=crop',
  is_main_profile: true
};

const USER_B = {
  name: '阿明 [测试B]',
  age: 27,
  location: '上海 浦东',
  job: '软件工程师',
  about: '码农一枚，周末骑行。测试完记得给我发消息！',
  tags: ['骑行', '科技', '美食'],
  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop',
  image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
  is_main_profile: false
};

const CONVERSATION = [
  { from: 'A', text: '你好！我是小雨，看到你的资料感觉很有意思～', minsAgo: 16 },
  { from: 'B', text: '你好小雨！我是阿明，你平时都画什么类型的插画？', minsAgo: 14 },
  { from: 'A', text: '我喜欢画日系风格的治愈系插画，还有一些城市写生 🎨', minsAgo: 12 },
  { from: 'B', text: '哇很棒！骑行的时候能遇到很多风景，或许可以作为素材', minsAgo: 10 },
  { from: 'A', text: '对啊！下次骑行能带我一起吗 😄', minsAgo: 8 },
  { from: 'B', text: '当然！上海滨江那条路特别美', minsAgo: 6 },
  { from: 'A', text: '好期待！你一般什么时候有时间呀？', minsAgo: 4 },
  { from: 'B', text: '周末一般都有空，可以约个时间～ 现在可以回复我哦！', minsAgo: 0 },
];

async function main() {
  console.log('🚀 开始设置聊天测试环境 (via proxy 127.0.0.1:7891)...\n');

  // 1. Test connection
  console.log('📡 测试 Supabase 连接...');
  const testData = await sbSelect('users', 'select=id,name&limit=3');
  if (!Array.isArray(testData)) {
    console.error('❌ 连接失败:', testData);
    process.exit(1);
  }
  console.log(`✓ 连接成功！当前数据库中有用户示例:`, testData.map((u: any) => u.name).join(', '));

  // 2. Clean up old test users
  console.log('\n🧹 清理旧测试数据...');
  const oldUsers = await sbSelect('users', 'name=like.*测试*&select=id');
  if (Array.isArray(oldUsers) && oldUsers.length > 0) {
    for (const u of oldUsers) {
      await sbDelete('messages', `sender_id=eq.${u.id}`);
      await sbDelete('messages', `receiver_id=eq.${u.id}`);
    }
    for (const u of oldUsers) {
      await sbDelete('users', `id=eq.${u.id}`);
    }
    console.log(`✓ 清理了 ${oldUsers.length} 个旧用户`);
  } else {
    console.log('✓ 无旧数据');
  }

  // 3. Reset all is_main_profile to false
  await sbPatch('users', 'id=not.is.null', { is_main_profile: false });
  console.log('✓ 重置主档案标志');

  // 4. Create User A
  console.log('\n👤 创建测试用户A (小雨)...');
  const usersAResult = await sbInsert('users', [USER_A]);
  const userA = Array.isArray(usersAResult) ? usersAResult[0] : usersAResult;
  console.log('✓ 用户A:', userA.name, '| ID:', userA.id);

  // 5. Create User B
  console.log('\n👤 创建测试用户B (阿明)...');
  const usersBResult = await sbInsert('users', [USER_B]);
  const userB = Array.isArray(usersBResult) ? usersBResult[0] : usersBResult;
  console.log('✓ 用户B:', userB.name, '| ID:', userB.id);

  // 6. Create conversation
  console.log('\n💬 生成对话历史...');
  const now = Date.now();
  const messages = CONVERSATION.map((msg) => ({
    sender_id: msg.from === 'A' ? userA.id : userB.id,
    receiver_id: msg.from === 'A' ? userB.id : userA.id,
    message: msg.text,
    time_display: msg.minsAgo === 0 ? '刚刚' : `${msg.minsAgo}分钟前`,
    unread_count: 0,
    is_read: msg.minsAgo > 0,
    created_at: new Date(now - msg.minsAgo * 60 * 1000).toISOString()
  }));

  await sbInsert('messages', messages);
  console.log(`✓ 创建了 ${messages.length} 条对话消息`);

  console.log('\n═══════════════════════════════════════');
  console.log('✅ 完成！请按以下步骤测试：');
  console.log('');
  console.log('1. 刷新浏览器 http://localhost:3000');
  console.log('2. 点击右上角「身份切换」按钮 👤');
  console.log('3. 当前是「小雨 [测试A]」— 进入「消息」页查看对话');
  console.log('4. 点击对话，发送一条消息');
  console.log('5. 返回，切换到「阿明 [测试B]」');
  console.log('6. 进入「消息」页，应看到小雨发来的消息');
  console.log('7. 回复后，再切换回小雨验证收到回复');
  console.log('═══════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ 脚本运行失败:', err.message || err);
  process.exit(1);
});
