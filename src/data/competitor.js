export const initialCompetitors = [
  {
    id: "comp-1",
    name: "Figma (社群功能與資源庫)",
    url: "https://figma.com",
    screenshot: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=800&auto=format&fit=crop",
    pros: "1. 社群生態極為強大，擁有海量的 Plugin 與 UI Kit；2. 多人協作實時流暢，延遲極低。",
    cons: "1. 資源庫缺乏分類深度，標籤常被濫用；2. 搜尋演算法較為陽春，難以精準定位高品質資源。",
    takeaways: "Figma 的資源卡片佈局清晰，直接將 Creator、按讚數、複製數（Duplicate）顯示於卡片底部，能作為我們資源整理模組的設計參考。但我們必須加強標籤的管理與階層分類。",
    updatedAt: "2026-07-15"
  },
  {
    id: "comp-2",
    name: "Mobbin (行動裝置 UI 靈感庫)",
    url: "https://mobbin.com",
    screenshot: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop",
    pros: "1. 收錄極為完整，按 Flow (如 Onboarding, Upgrade) 分類；2. 圖片清晰度極高，可篩選系統版本與 App 分類。",
    cons: "1. 付費門檻高，免費版限制多；2. 無法直接複製 Figma 元件，僅供視覺參考。",
    takeaways: "Mobbin 的 Flow 篩選（將一連串截圖串連成 User Flow）是其核心價值。我們在 UI Research 的案例中，也可以考慮未來支援「多圖串聯」的展示形式，這比單張截圖更具脈絡性。",
    updatedAt: "2026-07-18"
  }
];
