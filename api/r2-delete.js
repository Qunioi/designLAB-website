import { signObjectUrl } from './r2-upload-url.js';

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json');
  if (request.method !== 'POST') return response.status(405).json({ error: '只允許 POST' });
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) return response.status(500).json({ error: '伺服器尚未完成 R2 環境變數設定' });
  try {
    const publicBase = (process.env.R2_PUBLIC_URL || 'https://pub-cfdfde59ceb44b798935e3dc4a29de0d.r2.dev').replace(/\/$/, '');
    const publicUrl = String(request.body?.publicUrl || '');
    if (!publicUrl.startsWith(`${publicBase}/`)) return response.status(400).json({ error: '只能刪除本 R2 公開網址的檔案' });
    const key = decodeURIComponent(publicUrl.slice(publicBase.length + 1).split('?')[0]);
    if (!/^(images|videos)\/[a-zA-Z0-9._/-]+$/.test(key)) return response.status(400).json({ error: '無效的 R2 檔案路徑' });
    const deleteResponse = await fetch(signObjectUrl(key, 'DELETE'), { method: 'DELETE' });
    if (!deleteResponse.ok) return response.status(502).json({ error: `R2 刪除失敗（${deleteResponse.status}）` });
    return response.status(200).json({ deleted: true, key });
  } catch (error) { console.error('R2 delete URL error', error); return response.status(500).json({ error: '無法建立刪除網址' }); }
}
