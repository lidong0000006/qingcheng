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

const DISCOVER_USERS = [
  {
    name: 'Mei Lin',
    age: 26,
    distance: '3 公里',
    tags: ['生花', '爵士乐', '现代艺术'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANs6y1EVbi-pAHJDDi8YSNnO2wEO7IeCW8MZLLDKLnlvD9ip5zDBMMuqX6rasxtvIw-NnLAHA1IWtumNToFW7MeMIBOXRs1bBMwGDsqLGnR8L4HFfGRVlDnfPVDn26phbD5jQJbvnyGtEghrxxDo99VRaHwZcgSUan2QnD5LlwSR_h_2eWoJQ72S_KHmL4E2TkU0x29lSeTX7kARqohdb9zerqDkcJBcySRPm5A1dVonJLFjsZogzi1uL-2M_qU3PBuyyO0wF7-rXo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANs6y1EVbi-pAHJDDi8YSNnO2wEO7IeCW8MZLLDKLnlvD9ip5zDBMMuqX6rasxtvIw-NnLAHA1IWtumNToFW7MeMIBOXRs1bBMwGDsqLGnR8L4HFfGRVlDnfPVDn26phbD5jQJbvnyGtEghrxxDo99VRaHwZcgSUan2QnD5LlwSR_h_2eWoJQ72S_KHmL4E2TkU0x29lSeTX7kARqohdb9zerqDkcJBcySRPm5A1dVonJLFjsZogzi1uL-2M_qU3PBuyyO0wF7-rXo',
    is_main_profile: false
  },
  {
    name: '林逸',
    age: 29,
    distance: '5 公里',
    tags: ['茶道', '建筑'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMI6dqJVhsmifTQ78mBgmNmRTu0KgjnftHPKo9x0cD4bMGWTkAiFJz-IhNWClQXxepFr-oDprcabJxUPj5Kdq9oxL4UrSzPdx1FSE1KUg4IYKBSZtJ1nE7QhYQ3Ie7bgLzh-f6eQAD2uY_Wh3dQnaJNPOBDYUyjwdCrMsnmHmhq72O6wsc8i8QJ53Nuz_H_hbEzqeKdyztsz10Egd79CbzbgAKpIwrHWrepwrDlTEnLN_QD7XrhJqs59fFyy70uabPG8Z7q79LS_CJ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMI6dqJVhsmifTQ78mBgmNmRTu0KgjnftHPKo9x0cD4bMGWTkAiFJz-IhNWClQXxepFr-oDprcabJxUPj5Kdq9oxL4UrSzPdx1FSE1KUg4IYKBSZtJ1nE7QhYQ3Ie7bgLzh-f6eQAD2uY_Wh3dQnaJNPOBDYUyjwdCrMsnmHmhq72O6wsc8i8QJ53Nuz_H_hbEzqeKdyztsz10Egd79CbzbgAKpIwrHWrepwrDlTEnLN_QD7XrhJqs59fFyy70uabPG8Z7q79LS_CJ',
    is_main_profile: false
  },
  {
    name: '王雅',
    age: 24,
    distance: '8 公里',
    tags: ['钢琴', '美食', '摄影'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9qNCcwbgKoTG3z_fYJDfhf2eUCcVFECubYWgSqAT5Wl5L7D8ymO_xvH4q-Xiwzx01qQ02vRsIlGsBOxSsmt4zQD3deFcaLcj_RQfVhtJMQYmUEGMXRvLbr1OXYkTnNEQvLEXlOYDIhBk29-dfJyhGfdtn4wFA7_Q65o_q9nHVEDl0eHkzCGBzmgLZMhiFLZ4UHwnRECfE5viNC5fA7ZdEtUH7vq2YJar0aX_DyUPrUxlW82vlpyCQkjqsQtgstHf0AgDPq1b345Fw',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9qNCcwbgKoTG3z_fYJDfhf2eUCcVFECubYWgSqAT5Wl5L7D8ymO_xvH4q-Xiwzx01qQ02vRsIlGsBOxSsmt4zQD3deFcaLcj_RQfVhtJMQYmUEGMXRvLbr1OXYkTnNEQvLEXlOYDIhBk29-dfJyhGfdtn4wFA7_Q65o_q9nHVEDl0eHkzCGBzmgLZMhiFLZ4UHwnRECfE5viNC5fA7ZdEtUH7vq2YJar0aX_DyUPrUxlW82vlpyCQkjqsQtgstHf0AgDPq1b345Fw',
    is_main_profile: false
  },
  {
    name: 'Yilin',
    age: 26,
    distance: "2 公里",
    location: "Shanghai, Jing'an",
    tags: ['建筑师', '复旦大学', '168 厘米'],
    about: '一个在旧式石库门和现代玻璃大厦的交汇中寻找美感的城市观察者。周末我喜欢在西岸写生，或者去寻找最完美的精品咖啡。希望能遇到一个既喜欢图书馆的安静，也能享受爵士俱乐部热闹的人。',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9wTh-qsseuKR7r5bmqHYeSHyNtcaiAn8rXnzGZgdrZZSQCfMEFcw2vxo2ktWOBkzcbRsGVhefF37yCXshefBT6mlnL5TRfF8tAhPRYO234xpTSGTQn19q-TV6ZXVGJ1AXYg7os9yB9n4fd-jHBi6qAYY07KMpkG8NRWVZblgyrAlfTa7LOd72Kc1THirQR0_H6r9DnnP2HwQcXMyM4J4b_mJQW12awyxcNox3q355mYk_eZXjLJKNMAPglODvilH8Q26LOdePVaNh',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9wTh-qsseuKR7r5bmqHYeSHyNtcaiAn8rXnzGZgdrZZSQCfMEFcw2vxo2ktWOBkzcbRsGVhefF37yCXshefBT6mlnL5TRfF8tAhPRYO234xpTSGTQn19q-TV6ZXVGJ1AXYg7os9yB9n4fd-jHBi6qAYY07KMpkG8NRWVZblgyrAlfTa7LOd72Kc1THirQR0_H6r9DnnP2HwQcXMyM4J4b_mJQW12awyxcNox3q355mYk_eZXjLJKNMAPglODvilH8Q26LOdePVaNh',
    album: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9wTh-qsseuKR7r5bmqHYeSHyNtcaiAn8rXnzGZgdrZZSQCfMEFcw2vxo2ktWOBkzcbRsGVhefF37yCXshefBT6mlnL5TRfF8tAhPRYO234xpTSGTQn19q-TV6ZXVGJ1AXYg7os9yB9n4fd-jHBi6qAYY07KMpkG8NRWVZblgyrAlfTa7LOd72Kc1THirQR0_H6r9DnnP2HwQcXMyM4J4b_mJQW12awyxcNox3q355mYk_eZXjLJKNMAPglODvilH8Q26LOdePVaNh',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB2U7ZybLnLOLXJaEgHkK8ITTxNZqAGX4AV8M5kp8zpCunzNi4FbPIRomsNiz4fvMAkBM2ynIj7o209Fj_b1iZE2Pbp6YAabcW7TeGJqR078gj53Ow8LVAhKglXKI_hkkl2iB4lAehtYrPW4wKjKHM93Q2W4sZiqbTap7EN-o03rZR1xUlr9pwLusb9ulTD4juWY9hOPNZBl7RRT0EdFYTx74s-TinjURnrqXpSYZGGUWfiyewSm3tbuJIUSHzlzEo_6PCY-bXfVPIo',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCy1K-x1f8oBdUWYzF9ie7HdQsFR5CImLNGShHUX4SVDXwxXpM9F-h9YoQC4OLxaB9PBQyBUqSbl5MVEOLdCFGOx6vn-9EIsLiXZ959VsvRe4SHxWzDrgoZM9qxoVleEccLzATcqGIwpmOEwUoOHmt6jGAvdz0DE2POJds1A0-GStwc9sXSWcb3eABaoMCrjO7S4Mh_IuZMcDNkqRyDHSvPev0hPAYPKNtGJigT-KVthmrRfleZ9Jmhyy5fh6XHRrz20o_gQroAA5W1'
    ],
    is_main_profile: false
  }
];

const MAIN_PROFILE = {
  name: '李伟',
  age: 26,
  location: '上海',
  job: '艺术策展人',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKNjKS6hlFUA5YNX8nF0ID_DrAZqaeMKPfsOlt_I9sH3MhoI1s252OiKhJBzrWbcqjxHNc7pzm3DbVcQUY_tt-xt0DutqFHfRQ26QTJXvLKKNcHks_W4-QIB8vbvg1Rp_APY9277hCgDIHKtPhiA6LqaLPsVccVu7pIAv8zFp8Mk2AbGKFBYxDGMOhegqxHCRvMlneyYwa5a2zZ1XQBCr16dBIFdbahZR_X5y_fbTGQVJjnJY9-wpDvkPPKwrAZ3AdvwPcHhQ-FKuw',
  main_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEGmyD6XEsxoRnSQEo-tL8cq6RXHLuz2c7UYpJs3EK8sgq7-xdIg6kse9reVvj7di0SZ03FhyYvmAUicsK847S2N31e5F0WUdCMpcqeJ7hLqkRx_9ItE3caVxR4W942u6Fgf8So1CXiT-wcR386GpFcEYsQDcBicrw8e0nGgbn5LYw_ubHbryUKGV3cH6tyEbE0c3vwEK6vtQNS0-cpAcHk1qYCp3Xt9j53J91wxIxyjFPtHP_-MVUNxmnCvpW3go6J2YbzKNI4EMB',
  album: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCL19bnTQy-bKErk81_g39ewlPduXazfs3og2DltczIOBd29taiUgy-aRoet3NB83Of0vRUp7OyC39Sfw4O8qO8nW7S94gIR9foSY8bQ-dYHAW6UVeq9j8UFz8z-yxJGFCtaqopaCj02QnpDmXdOaTZbl1McEOc1IR6HmLnZGMo6MioT7zcZNBF_IbyEjXL1kSliU2Dcyu-zPyMNpLqFUuRQJz9Vj3zcBDLJq9GDrhE36ogVSjeouMna_6mO-AsfbJueKkbEC126oYO',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAgSz0NDlZ5KGKJTAL20DOjaqn_Q8WiI1YTmX-p2QWlEyyR28hgsdC1J28SyKPcePmlNKYgjDRH1-b1AGvXkNhm1GPzJTlIx_ii9YUx1IZQOzBxVvNgVh73M2Hhj8Xns9CyejF__Q5vkAV-yK2z4KlQuAMIC4yVUhId_LT1Ez5ynkcAhbB1wPXeRl44lkLgsy1RG-bxM6SaQJLu96wBP9BFjXSCjF_nUR9n_wb2YPL7Is2WKWChfYtojubjMoWiJkwhE4TaSnZL7Wtk',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDn_vgCsUP2b8GovTBdKyxUkSexH-Meo70F4R8G6FAJcEHL0Bk7jYizYEbBwTcc_paXA88CTUujJzg-Jse53U18c8UOB5FxXprbBEhna6GQNJKr6tr6KpGKAzn5fLlykocziCYZez1YfHr1szaliJqCYfG433acGcLtdRkdrK4pY_Tu2ak-CK_UgYqp81ZwIXtqSjOFNwI0D6wRm43Ic2zwZxqrUg1O0b16sr_3tGrrwtlaG0AM_6Zis4nY0wl5VWOy9DKJuFulSMg_'
  ],
  is_main_profile: true
};

const MESSAGES = [
  {
    name: 'Chen Wei',
    time_display: '2分钟前',
    message: '我真的很喜欢你分享的那首诗。它让我想起...',
    unread_count: 2,
    is_read: false,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRo1S1N7-Uz_uQg0cq_2m-Tei4IcCkcUJjtufrNsSaKS9X8-fKw1V_R90E8JU2y1PpW7-E-Utw_erof7NfpSvd-jwAzuH72D7sATvBBbxNmTXq0zsHzphArYwMfbaCEFNBRHT52C6wRNRupztGgGhWKnCfnaa5a6SM--DkvxB8x50eTY2-BL85bRRfZ-gH2CdUr1K9mhg6D1wOKB6tQcmAmR_yvsY85_3ahTHO9bXQ6jz1ZJia2wyfOet2pkSvVhwHxZDY1ta1pV1A'
  },
  {
    name: 'Li Ling',
    time_display: '1小时前',
    message: '画展将在晚上7点开始。你想一起去吗？',
    unread_count: 0,
    is_read: false,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcRIFMoCvgN0z3DKugQlWyqe8_S2H-XIuDgtFsvBij5wKUEt2M2mAbfV_oxyFbSbxrDlkFfuLxoFbC5Ny_VWoZs8blIcnASvHVDwNBNBWa3CI_obnASw6cApR0gdi0Pn6v3tHRgVSmG8ve5OAW7ESEdqRR1EwQ_-_5l0E_H_AtiDZF8cGIoPDIbjYR0h07TaZ4_VARUDfDp3-rVI4bcNylEj3mBX_zUlLuK3HVNFa-SpAbY6wG5EuYspeH3QoN4uS-CcVRWBjO2sec'
  },
  {
    name: 'Zhang Kai',
    time_display: '3小时前',
    message: '关于现代艺术，这确实是一个非常有趣的视角。',
    unread_count: 0,
    is_read: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAco_ZtSF2w7UfzZeMZJfgFezPgkQPOHxLAB20xQSbi56n8S2x5krrGhep-ICfBdkM1p5Ssf1dbTfaGyaLGVTJVFgew93Y_72dIbCbnNZo7dBi_uj145KgGzFqYtMK2b1TyH_ttZfApkdF3LT8ARCfDsz7zHPOwUuByK71XNOMjeXlOCY_bOYXrVbidnk4a8V7GtL-Hi5H34vCPEGbYG-OpVNkgzIujMZw6BeXZKlkqBYJtpgO6chAYT33mxNLmYbl6zhyclI1bYos4'
  }
];

async function seed() {
  console.log('Seeding data to Supabase...');

  // 1. Clear existing data
  console.log('Cleaning up old data...');
  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Insert main profile
  console.log('Inserting main user...');
  const { data: mainProfileData, error: mainError } = await supabase
    .from('users')
    .insert([MAIN_PROFILE])
    .select()
    .single();

  if (mainError) {
    console.error('Error inserting main profile:', mainError.message);
    return;
  }

  // 3. Insert discover users
  console.log('Inserting discover users...');
  const { data: discoverUsersData, error: discoverError } = await supabase
    .from('users')
    .insert(DISCOVER_USERS)
    .select();

  if (discoverError) {
    console.error('Error inserting discover users:', discoverError.message);
    return;
  }

  // 4. Insert messages
  console.log('Inserting messages...');
  const messagesToInsert = MESSAGES.map(msg => {
    return {
      message: msg.message,
      time_display: msg.time_display,
      unread_count: msg.unread_count,
      is_read: msg.is_read,
      receiver_id: mainProfileData.id,
      sender_id: discoverUsersData[Math.floor(Math.random() * discoverUsersData.length)].id
    };
  });

  const { error: messageError } = await supabase
    .from('messages')
    .insert(messagesToInsert);

  if (messageError) {
    console.error('Error inserting messages:', messageError.message);
    return;
  }

  console.log('✅ Seed completed successfully!');
}

seed().catch(console.error);
