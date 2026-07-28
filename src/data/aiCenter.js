export const initialAICenter = [
  {
    id: "ai-1",
    name: "Midjourney v6 (介面風格探索)",
    link: "https://midjourney.com",
    useCase: "在專案初期快速探索插畫風格、色彩搭配與 UI 概念圖",
    prompt: "App UI screen, fintech dashboard, premium dark mode, neon violet and blue glow, futuristic glassmorphism charts, high fidelity, UX, UI, Figma, clean design --ar 16:9 --v 6.0",
    workflow: [
      "使用 ChatGPT 產生細緻的 Prompt 描述",
      "輸入 Midjourney 生成 4 張概念圖",
      "挑選最合適的圖，在 Figma 中利用滴管工具汲取漸層色彩",
      "參考其排版與陰影深度，繪製成向量 UI。"
    ],
    createdAt: "2026-07-10 14:00:00",
    updatedAt: "2026-07-28 14:30:00",
    createdBy: "Quni (@quni_jhuang)",
    updatedBy: "Quni (@quni_jhuang)"
  },
  {
    id: "ai-2",
    name: "ChatGPT GPT-4o (使用者研究訪談生成)",
    link: "https://chatgpt.com",
    useCase: "快速生成用戶訪談問卷、可用性測試腳本與競品分析框架",
    prompt: "我們正在設計一款給設計師使用的內部知識管理平台，目標用戶為 3-10 人的設計小組。請生成一份包含 10 個問題的半結構式用戶訪談腳本，重點了解：1) 現有設計資料的管理痛點 2) 搜尋靈感的習慣流程 3) 對知識沉澱的態度。問題需開放式，避免引導性措辭。",
    workflow: [
      "輸入 Prompt，根據產品階段調整背景描述",
      "複製訪談綱到 Google Docs",
      "訪談後用 GPT 整理逐字稿的關鍵洞察",
      "將洞察轉化為 HMW (How Might We) 問句，導入設計提案。"
    ],
    createdAt: "2026-07-15 16:30:00",
    updatedAt: "2026-07-28 14:30:00",
    createdBy: "Alex (@alex_designer)",
    updatedBy: "Alex (@alex_designer)"
  },
  {
    id: "ai-3",
    name: "Claude Sonnet (設計評審與 UX 文案優化)",
    link: "https://claude.ai",
    useCase: "對設計稿進行批判性 UX 審查、生成 UI 文案與 Error Message",
    prompt: "你是位資深 UX 設計師，請對以下設計截圖進行批判性審查：從資訊架構、可用性、視覺層次三個面向提出具體改進建議，並提供替代方案。請用繁體中文回答，條列式呈現，每點附上理由。",
    workflow: [
      "截圖當前設計稿",
      "貼入 Claude 並附上以上 Prompt",
      "根據建議在 Figma 中製作 A/B 版本",
      "將有效建議記錄到 Design LAB 的 UI Research。"
    ],
    createdAt: "2026-07-21 09:10:00",
    updatedAt: "2026-07-28 14:30:00",
    createdBy: "Quni (@quni_jhuang)",
    updatedBy: "Quni (@quni_jhuang)"
  },
  {
    id: "ai-4",
    name: "Galileo AI (設計稿自動生成)",
    link: "https://usegalileo.ai",
    useCase: "輸入文字描述，自動生成完整的 Figma 設計稿初稿",
    prompt: "A SaaS analytics dashboard for a design team. Include: left sidebar navigation with icons, a header with search bar and user avatar, a 3-column bento grid with metrics cards, a line chart for weekly activity, and a recent items list. Dark mode, purple accent color.",
    workflow: [
      "在 Galileo 輸入詳細的版面描述",
      "選擇最接近需求的版本",
      "匯出到 Figma 進行精修",
      "替換 Placeholder 文字為真實內容，調整色彩系統與字型。適合快速起草 Wireframe 結構，節省從空白畫布開始的時間。"
    ],
    createdAt: "2026-07-22 15:40:00",
    updatedAt: "2026-07-28 14:30:00",
    createdBy: "Sarah (@sarah_pm)",
    updatedBy: "Sarah (@sarah_pm)"
  }
];
