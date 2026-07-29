/**
 * 本地檔案上傳與轉換工具 (支援圖片與影片)
 */

export function uploadFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('未選擇任何檔案'));
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      return reject(new Error('請上傳有效的圖片 (.png, .jpg, .gif, .webp) 或影片 (.mp4, .webm) 檔案'));
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const resultUrl = e.target.result;
      resolve({
        url: resultUrl,
        name: file.name,
        type: isImage ? 'image' : 'video',
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
    };

    reader.onerror = () => {
      reject(new Error('檔案讀取失敗，請重新嘗試'));
    };

    reader.readAsDataURL(file);
  });
}
