export function updateThemeFavicon() {
  const link = document.querySelector('link[rel="icon"]');
  if (!link) return;

  const styles = getComputedStyle(document.documentElement);
  const background = styles.getPropertyValue('--action-primary').trim();
  const foreground = styles.getPropertyValue('--action-on-primary').trim();
  if (!background || !foreground) return;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="${background}"/><path fill="${foreground}" transform="translate(1 0)" d="M8 8h6.5C20 8 23 11.1 23 16s-3 8-8.5 8H8zm4 3.5v9h2.5c3 0 4.5-1.6 4.5-4.5s-1.5-4.5-4.5-4.5z"/></svg>`;
  link.type = 'image/svg+xml';
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
