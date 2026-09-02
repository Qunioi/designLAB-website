import { signObjectUrl } from './r2-upload-url.js';

const escapeXml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const decodeXml = (value) => value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json');
  if (request.method !== 'POST') return response.status(405).json({ error: '只允許 POST' });
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) return response.status(500).json({ error: '伺服器尚未完成 R2 環境變數設定' });
  try {
    const requestedPrefix = request.body?.prefix || '';
    const prefix = requestedPrefix === 'images' ? 'images/' : requestedPrefix === 'videos' ? 'videos/' : '';
    const listUrl = signObjectUrl('', 'GET', { 'list-type': '2', prefix, 'max-keys': '100' });
    const result = await fetch(listUrl);
    if (!result.ok) return response.status(502).json({ error: '無法讀取 R2 檔案清單' });
    const xml = await result.text();
    const publicBase = (process.env.R2_PUBLIC_URL || 'https://pub-cfdfde59ceb44b798935e3dc4a29de0d.r2.dev').replace(/\/$/, '');
    const objects = [...xml.matchAll(/<Key>(.*?)<\/Key>/g)].map((match) => {
      const key = decodeXml(match[1]);
      return { key, name: key.split('/').pop(), publicUrl: `${publicBase}/${key.split('/').map(encodeURIComponent).join('/')}` };
    });
    return response.status(200).json({ objects });
  } catch (error) { console.error('R2 list error', error); return response.status(500).json({ error: '無法讀取檔案清單' }); }
}
