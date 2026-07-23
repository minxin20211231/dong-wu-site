# 懂屋導航地圖｜Claude 接手交接書

交接日期：2026-07-17  
專案位置：`C:\Users\winte\Documents\AI workflow\懂屋KYH\dong-wu-site`  
正式路由：`/map/`

## 先看結論

目前 Demo 已完成，可作為下一輪產品與內容規劃的基準。Bibo 已確認大翅鯨島鏈、奶茶色晨曦海面、15 站流程、帆船跨海與站點依序亮起的方向。

現行頁面不是即時 3D。正式顯示方式是：

- 一張已確認的大翅鯨島鏈 Keyframe 作為底圖。
- HTML／CSS 疊加 15 個站點、陸地路線、藍色點狀航線、帆船與亮燈狀態。
- TypeScript 依滾動位置更新目前站、路線進度、面板與解鎖狀態。
- 頁面目前不載入 Three.js／GSAP；相關實驗程式仍保留在專案中，供未來評估，不代表已採用於現行 Demo。

## Bibo 已確認，不要自行改回

- URL 使用 `/map/`。
- 初版採免費瀏覽＋Email 解鎖。
- 站點分批上線：01–04 為 `open`，05–15 為 `coming-soon`。
- 地圖維持大翅鯨外形，不改回一般四島、卡片牆或棋盤式排列。
- 主色為暖燕麥、淺奶茶、低飽和草地與焦糖橘路線；海面是淡奶茶色晨曦感。
- Icon／站景採簡化的微縮 3D 模型語言，不使用複雜寫實人物。
- 帆船使用與底圖相同光向、材質和微縮比例的新版透明素材。
- 15 站依裝修流程前進，島與島過不去時才使用橋或帆船，不可任意跳站。

## 最終站點順序

1. 01–04：鯨頭。
2. 05–07：背部。
3. 08–10：尾鰭區。
4. 10→11：藍色點狀發光海路，帆船由等待進入航行，再抵達下方島鏈。
5. 11–13：下方左島。
6. 14–15：下方右島，15 為終站。

實際座標、期別、名稱、狀態與工具內容以 `src/data/mapStations.ts` 為單一資料來源。

## 核心素材

- `public/map/map-whale-keyframe-v1.png`：已確認的原始 Keyframe，1672 × 941。
- `public/map/map-whale-keyframe-v1.webp`：網站載入版。
- `public/map/map-sailboat-v2.png`：新版透明帆船 fallback。
- `public/map/map-sailboat-v2.webp`：網站載入版透明帆船。

不要重新生成或替換上述素材，除非 Bibo 明確提出新的視覺修改。

## 現行程式結構

- `src/pages/map.astro`：頁面入口與 15 站 SSR 結構。
- `src/components/map/MapStage.astro`：底圖、三段路線、海路、帆船與站點熱區。
- `src/components/map/ProgressRail.astro`：15 站進度導覽。
- `src/components/map/MapStation.astro`：各站內容段落。
- `src/components/map/StationPanel.astro`：原生 `<dialog>` 工具面板。
- `src/components/map/PhaseGate.astro`：四期分段標示。
- `src/data/mapStations.ts`：15 站資料的單一來源。
- `src/scripts/map/bootstrap.ts`：滾動偵測、亮燈進度、面板、Email 解鎖與候補事件。
- `src/styles/map.css`：地圖版面、航線、帆船、站點與響應式樣式。

共用相依檔：

- `src/layouts/BaseLayout.astro`
- `src/components/SiteHeader.astro`
- `src/components/BottomNav.astro`
- `src/styles/global.css`

保留但目前未由 `/map/` 載入的實驗檔：

- `src/scripts/map/scene.ts`
- `src/scripts/map/performance-tier.ts`
- `src/scripts/map/phases/phase-01.ts`～`phase-04.ts`
- `src/data/mapCameraPoses.ts`

## 現行互動與資料狀態

- 目前站點由 `IntersectionObserver` 判斷。
- 01→10、10→11 海路、11→15 分別保存路線進度。
- Email 解鎖與已造訪站點暫存於 `localStorage`。
- Email／候補表單目前只執行 Demo callback 與畫面狀態，不會把資料送到外部服務。
- 對外整合入口為 `window.dongWuMapCallbacks` 與 `map:*` 自訂事件。
- 05–15 即使完成 Email 解鎖，仍維持 `coming-soon`，不可誤開放。

## 已完成驗證

- 2026-07-16 Astro production build 成功，共產出 29 個頁面。
- `/map/` 的 client bundle 為 14.59 kB，gzip 6.29 kB。
- 15 個地圖站點與 15 個內容段落均存在，編號無缺漏。
- 桌面 1440 × 900、手機 390 × 844 已做版面檢查，當時無水平溢出。
- Email 解鎖、候補 Demo、原生 dialog、hash 直達與路線亮燈已測試。
- 已產出單一自包含 HTML：`_archive/懂屋導航地圖_確認版_2026-07-16.html`。

完整紀錄見 `docs/map/verification.md`。

## Claude 下一輪建議先規劃的問題

1. 定義 01–04 每站正式可解鎖工具的內容、格式與完成條件。
2. 決定 Email 解鎖要串接的服務、資料欄位、同意文案與失敗重送流程。
3. 排定 05–15 的上線批次，不要一次假設全部開放。
4. 決定維持現行 Keyframe 方案，或另立一個有明確效益與效能預算的即時 3D 版本；不要直接把保留的 Three.js 實驗碼視為正式需求。
5. 補部署環境 Lighthouse、iPhone Safari、Android Chrome 與鍵盤完整操作驗收。
6. 規劃正式分析事件與轉換漏斗，再把 callback 接到實際分析／Email 後端。

## 建置方式

在專案根目錄執行：

```powershell
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 4322
npm.cmd run build
```

本機曾遇到 Node 24.13 的 Windows 原生行程崩潰；同一份原始碼改用 Node 24.14 後建置成功。若重現，先確認 Node 版本，不要先改專案程式。

## 歸檔邊界

這份交接包是「導航地圖選定檔案的快照」，不是 Git commit，也不是整個懂屋官網的完整備份。工作樹另有其他未提交修改，為避免混入不相關工作，歸檔只收錄地圖模組、必要共用檔、素材、規格文件與可預覽 HTML；不含 `node_modules`、`dist`、`.git`、`_tmp` 與其他官網頁面。
