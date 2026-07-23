# 裝修新手島 Claude 交接補充｜REV3

更新日期：2026-07-20  
主交接文件：`docs/map/CLAUDE_HANDOFF_2026-07-20.md`

## 本版新增完成項目

### 第 15 站位置與尺寸

- `src/data/mapStations.ts`：第 15 站座標由 `73/59` 改成 `73/54`，往上移動，x 不變。
- `src/styles/map.css`：桌機版第 15 站標記獨立限制為 `clamp(24px, 2.15vw, 34px)`。
- 手機版沿用既有 25px 標記規則，沒有改動第 14、16 站或底圖。
- 1672×941 底圖上，14／15／16 三組中心距離約為 241px、238px、350px。

### LINE 社群品牌圖

最終圖檔位於工作區品牌素材：

- `懂屋KYH/品牌素材/Logo/裝修新手島_Logo提案/精修版本/LINE社群/裝修新手島_LINE社群背景_1080x1536.png`
- `懂屋KYH/品牌素材/Logo/裝修新手島_Logo提案/精修版本/LINE社群/裝修新手島_LINE社群頭貼_1024x1024.png`

背景圖使用 AI 建立無字底景，再疊入 `public/map/map-logo-island-v1.webp` 原始 Logo；頭貼直接使用 `public/map/map-community-v1.webp` 三人角色合成。中文字與角色均不是由 AI 重畫。

LINE 官方說明只要求在預覽時調整裁切範圍，未公布 OpenChat 背景與個人檔案圖的固定像素尺寸；本版採用 1080×1536 直式背景與 1024×1024 正方形頭貼，並保留中央裁切安全區。

## 驗證結果

- 隔離 QA 副本執行 `npm.cmd run build` 成功，共建置 29 個頁面。
- `/island/` 實測第 14／15／16 站標記尺寸為 40／34／40px；第 15 站位於另外兩站上方。
- 瀏覽器主控台沒有 warning 或 error。
- 主專案原有 `node_modules` 在建置時發生 `aria-query`／`axobject-query` 模組解析與目錄權限錯誤；未重裝依賴，避免污染環境。原始碼已同步到 QA 副本並成功驗證。

## 尚待 Claude／Bibo 補齊

- 取得正式 LINE OpenChat 網址後，更新 `src/data/islandCommunity.ts`：`status` 改為 `open` 並填入 `href`。
- 不要填入假網址，也不要改動目前保留的 LINE 社群通道。
