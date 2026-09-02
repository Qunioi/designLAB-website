const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'];
const MIME_TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' };
export const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const GIF_MAX_SIZE = 10 * 1024 * 1024;
export const VIDEO_MAX_SIZE = 50 * 1024 * 1024;
export const ALL_MEDIA_MAX_SIZE = 100 * 1024 * 1024;

const extensionOf = (name) => name.toLowerCase().split('.').pop();
const apiUrl = (path) => {
  const configuredBase = import.meta.env.VITE_UPLOAD_API_URL;
  const base = configuredBase ? `${configuredBase.replace(/\/$/, '')}/` : new URL('./api/', window.location.href).href;
  return new URL(path, base).href;
};

export function validateMediaFile(file) {
  if (!file) throw new Error('未選擇任何檔案');
  const extension = extensionOf(file.name);
  const isImage = IMAGE_EXTENSIONS.includes(extension);
  const isVideo = VIDEO_EXTENSIONS.includes(extension);
  const maxSize = extension === 'gif' ? GIF_MAX_SIZE : (isImage ? IMAGE_MAX_SIZE : VIDEO_MAX_SIZE);
  if (!isImage && !isVideo) throw new Error('不支援的檔案格式。圖片：JPG、JPEG、PNG、WEBP、GIF；影片：MP4、WEBM、MOV。');
  if (file.size > maxSize) throw new Error(`${extension === 'gif' ? 'GIF' : isImage ? '圖片' : '影片'}大小不可超過 ${maxSize / (1024 * 1024)} MB。`);
  return { isImage, isVideo, extension, contentType: MIME_TYPES[extension] };
}

export function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function uploadFile(file, onProgress = () => {}) {
  const { isImage, contentType } = validateMediaFile(file);
  const previewUrl = URL.createObjectURL(file);
  const response = await fetch(apiUrl('r2-upload-url'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, contentType, size: file.size })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || '無法取得安全上傳網址');
  await new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', payload.uploadUrl); request.setRequestHeader('Content-Type', contentType);
    request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100)); };
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(`R2 上傳失敗（${request.status}）`));
    request.onerror = () => reject(new Error('無法連線至 R2。請確認 Bucket CORS 已允許目前網站來源，且網路可連線到 R2。')); request.onabort = () => reject(new Error('上傳已取消')); request.send(file);
  });
  return { url: payload.publicUrl, name: file.name, type: isImage ? 'image' : 'video', size: formatFileSize(file.size), previewUrl };
}

export async function deleteUploadedFile(publicUrl) {
  if (!publicUrl) return;
  const response = await fetch(apiUrl('r2-delete'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicUrl })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || '無法取得刪除網址');
  if (!payload.deleted) throw new Error('R2 檔案刪除未完成');
}

export async function listUploadedFiles(prefix = '') {
  const response = await fetch(apiUrl('r2-list'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefix })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || '無法讀取檔案清單');
  return payload.objects || [];
}
