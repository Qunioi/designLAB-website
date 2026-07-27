export const initialAICenter = [
  {
    id: "ai-1",
    name: "Midjourney v6 (介面風格探索)",
    useCase: "在專案初期快速探索插畫風格、色彩搭配與 UI 概念圖",
    prompt: "App UI screen, fintech dashboard, premium dark mode, neon violet and blue glow, futuristic glassmorphism charts, high fidelity, UX, UI, Figma, clean design --ar 16:9 --v 6.0",
    workflow: "1. 使用 ChatGPT 產生細緻的 Prompt 描述 -> 2. 輸入 Midjourney 生成 4 張概念圖 -> 3. 挑選最合適的圖，在 Figma 中利用滴管工具吸取漸層色彩 -> 4. 參考其排版與陰影深度，繪製成向量 UI。",
    link: "https://midjourney.com"
  },
  {
    id: "ai-2",
    name: "v0.dev by Vercel (前端 UI 組件生成)",
    useCase: "快速生成基於 Tailwind 的 React/Vue 基礎 UI 程式碼原型",
    prompt: "A beautiful premium dark mode dashboard dashboard header with a glassmorphism navigation sidebar, user profile avatar, search input with Cmd+K badge, notifications button, clean layout, futuristic vibes.",
    workflow: "1. 描述你想要的 UI 區塊 -> 2. v0 產生幾種版本 -> 3. 直接在瀏覽器預覽並調整文字 -> 4. 複製生成的程式碼，微調後轉換成我們的 Vue 元件，節省 80% 的切版時間。",
    link: "https://v0.dev"
  }
];
