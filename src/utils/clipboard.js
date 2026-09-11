export async function copyToClipboard(text) {
  if (!text) return false;

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('[Clipboard] navigator.clipboard.writeText 執行失敗，嘗試 execCommand 回退機制:', err);
    }
  }

  // Clipboard API 不可用或失敗時（例如非 HTTPS）改用 execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // 避免畫面滾動或產生視效干擾
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('[Clipboard] execCommand 複製失敗:', err);
    return false;
  }
}
