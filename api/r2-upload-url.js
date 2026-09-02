import crypto from 'node:crypto';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov']);
const IMAGE_MAX_SIZE = 10 * 1024 * 1024;
const VIDEO_MAX_SIZE = 200 * 1024 * 1024;

const encode = (value) => encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
const hmac = (key, value) => crypto.createHmac('sha256', key).update(value).digest();
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

export function signObjectUrl(key, method = 'PUT', extraQuery = {}) {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET_NAME || 'designlab-website';
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const region = 'auto';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const credential = `${accessKey}/${date}/${region}/s3/aws4_request`;
  const path = key ? `/${encode(bucket)}/${key.split('/').map(encode).join('/')}` : `/${encode(bucket)}`;
  const query = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256', 'X-Amz-Credential': credential,
    'X-Amz-Date': amzDate, 'X-Amz-Expires': '900', 'X-Amz-SignedHeaders': 'host',
    ...extraQuery
  };
  const canonicalQuery = Object.keys(query).sort().map((name) => `${encode(name)}=${encode(query[name])}`).join('&');
  const canonicalRequest = [method, path, canonicalQuery, `host:${host}\n`, 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  const scope = `${date}/${region}/s3/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, hash(canonicalRequest)].join('\n');
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, date), region), 's3'), 'aws4_request');
  query['X-Amz-Signature'] = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  const signedQuery = Object.keys(query).sort().map((name) => `${encode(name)}=${encode(query[name])}`).join('&');
  return `https://${host}${path}?${signedQuery}`;
}

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json');
  if (request.method !== 'POST') return response.status(405).json({ error: '只允許 POST' });
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) return response.status(500).json({ error: '伺服器尚未完成 R2 環境變數設定' });
  try {
    const { fileName, contentType, size } = request.body || {};
    const safeName = String(fileName || '').split(/[\\/]/).pop().replace(/(image|video)\/[a-z0-9.+-]+$/i, '').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+$/, '');
    const extension = safeName.toLowerCase().split('.').pop();
    const isImage = IMAGE_EXTENSIONS.has(extension); const isVideo = VIDEO_EXTENSIONS.has(extension);
    const numericSize = Number(size);
    if ((!isImage && !isVideo) || !Number.isFinite(numericSize) || numericSize < 1) return response.status(400).json({ error: '不支援的檔案格式' });
    if (numericSize > (isImage ? IMAGE_MAX_SIZE : VIDEO_MAX_SIZE)) return response.status(413).json({ error: `${isImage ? '圖片' : '影片'}大小超過限制` });
    const expectedPrefix = isImage ? 'image/' : 'video/';
    if (!String(contentType || '').startsWith(expectedPrefix)) return response.status(400).json({ error: '檔案類型與副檔名不一致' });
    const folder = isImage ? 'images' : 'videos';
    const key = `${folder}/${crypto.randomUUID()}-${safeName}`;
    const publicBase = (process.env.R2_PUBLIC_URL || 'https://pub-cfdfde59ceb44b798935e3dc4a29de0d.r2.dev').replace(/\/$/, '');
    return response.status(200).json({ uploadUrl: signObjectUrl(key), publicUrl: `${publicBase}/${key}` });
  } catch (error) { console.error('R2 upload URL error', error); return response.status(500).json({ error: '無法建立上傳網址' }); }
}
