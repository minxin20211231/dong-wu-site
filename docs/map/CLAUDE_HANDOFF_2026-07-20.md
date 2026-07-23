# 裝修新手島｜Claude 接手交接書

交接日期：2026-07-20  
專案位置：`C:\Users\winte\Documents\AI workflow\懂屋KYH\dong-wu-site`  
目前頁面：`/island/`

> 本文件取代 `CLAUDE_HANDOFF_2026-07-17.md` 與 `codex-visual-handoff-2026-07-17.md` 的舊狀態。舊文件仍可查歷程，但其中的 `/map/`、15 站、藍色海路等描述已過時。

## Claude 先做這三件事

1. 先讀本文件，再讀 `src/pages/island.astro`、`src/data/mapStations.ts`、`src/styles/map.css`。
2. 先執行 `git status --short`。目前地圖模組是未提交工作，不可執行 `git clean`、`git reset --hard` 或覆蓋整個資料夾。
3. 執行 `npm.cmd run build`，確認接手環境可完成 Astro 正式建置，再開始修改。

## 現況結論

- 正式顯示採「一張靜態島嶼底圖＋DOM 站點＋SVG 路線＋獨立帆船」；不是即時 3D。
- 共四階段、十六站。01–04 為 `open`，05–16 為 `coming-soon`。
- 底圖沿用原有大翅鯨島形，只在 v2 合成現成軟裝家電 icon；不要重新生成底圖。
- 10→11 的視覺路線是黃色密集點狀航線。帆船只在海面 A→B 移動，不會停在島面。
- LINE 社群入口已完成介面，但目前仍是 `coming-soon`，尚未填 OpenChat 網址。
- 稱呼與 Email 表單目前都是 Demo；沒有把資料送到外部服務。

## Bibo 已定案，不要自行改回

- URL 使用 `/island/`。
- Hero 標題固定兩行：
  - 第一行：`裝修有導航`
  - 第二行：`新手不迷路`，其中「新手」使用焦糖橘。
- Hero 小標：`你不用一次懂完裝修，只要知道下一站往哪走`
- 四階段名稱：`籌備與規劃`、`拆改與保護`、`裝潢與粉刷`、`設備與入住`。
- 四階段小標桌面最大 19.2px、手機 16px；不要縮回舊版約 12.5px。
- 14／15／16 站使用左、右上、右下的三角排列；最新座標已再拉開，避免與底圖家具群聚。
- Hero 與最終「準備登島」共用的裝修新手島 Logo 必須主動載入；Hero 維持 `loading="eager"`、`fetchpriority="high"`、`decoding="sync"`，最終 Logo 維持 `loading="eager"`、`decoding="sync"`，不要改回延遲載入。
- 最終登島表單與彈窗都要有「怎麼稱呼您？」和 Email；稱呼必填。
- 登島表單輸入框為 12px 圓角；「完成登島」是白字 16px 圓弧按鈕。
- 痛點卡內文 16px；四步驟卡採珊瑚橘、暖金、草綠、海水藍四色漸層。
- 工程報價內容若未來新增預設值，不得低於 80 萬元。

## 最終 16 站座標

座標以 `src/data/mapStations.ts` 為唯一資料來源；下表是 2026-07-20 快照。

| 站 | 名稱 | 階段 | x% | y% | 狀態 |
|---|---|---|---:|---:|---|
| 01 | 買屋驗屋站 | 籌備與規劃 | 13 | 30 | open |
| 02 | 需求釐清站 | 籌備與規劃 | 22 | 31 | open |
| 03 | 設計繪圖站 | 籌備與規劃 | 32 | 35 | open |
| 04 | 預算與合約站 | 籌備與規劃 | 41 | 39 | open |
| 05 | 保護工程站 | 拆改與保護 | 51 | 33 | coming-soon |
| 06 | 拆除工程站 | 拆改與保護 | 61 | 33 | coming-soon |
| 07 | 泥作防水站 | 拆改與保護 | 70 | 38 | coming-soon |
| 08 | 水電弱電站 | 拆改與保護 | 86 | 25 | coming-soon |
| 09 | 空調消防站 | 裝潢與粉刷 | 84 | 42 | coming-soon |
| 10 | 木作工程站 | 裝潢與粉刷 | 88 | 58 | coming-soon |
| 11 | 系統家具站 | 裝潢與粉刷 | 30 | 62 | coming-soon |
| 12 | 油漆粉刷站 | 裝潢與粉刷 | 38 | 69 | coming-soon |
| 13 | 燈具設備安裝站 | 設備與入住 | 47 | 75 | coming-soon |
| 14 | 清潔驗收站 | 設備與入住 | 60 | 65 | coming-soon |
| 15 | 軟裝家電站 | 設備與入住 | 73 | 54 | coming-soon |
| 16 | 幸福入住站 | 設備與入住 | 80 | 76 | coming-soon |

## 路線與帆船

- SVG 定義位置：`src/components/map/MapStage.astro`。
- 01→10：上方陸路。
- 10→11：黃色密集點狀海路。視覺路線仍連接兩站，但帆船使用獨立 motion path。
- 帆船起點 A：`89% / 82%`。
- 帆船終點 B：`25% / 75%`。
- 航行中段會下探海面約 `46.5% / 93.5%`，避免穿過島體。
- 11→16：下方陸路，14→15→16 已配合三角排列重畫。

## 核心程式結構

- `src/pages/island.astro`：頁面入口、Hero、痛點、四步驟、FAQ、最終登島表單。
- `src/components/map/MapStage.astro`：底圖、SVG 路線、帆船與 16 站熱區。
- `src/components/map/MapStation.astro`：每站卡片。
- `src/components/map/StationPanel.astro`：原生 `<dialog>`、免費解鎖、候補表單。
- `src/components/map/ProgressRail.astro`：右側 16 站進度。
- `src/components/map/PhaseGate.astro`：四階段過場。
- `src/components/map/IslandCommunityDock.astro`：右下角 LINE 社群入口。
- `src/components/map/IslandPainIcon.astro`：痛點卡品牌 icon。
- `src/data/mapStations.ts`：站名、內容、狀態與座標的唯一資料來源。
- `src/data/islandCommunity.ts`：社群開放狀態與網址。
- `src/scripts/map/bootstrap.ts`：滾動進度、面板、帆船、localStorage、callback 與事件。
- `src/styles/map.css`：地圖與整頁響應式樣式。

保留但目前正式頁面未載入的實驗程式：`src/scripts/map/scene.ts`、`performance-tier.ts`、`phases/`、`src/data/mapCameraPoses.ts`。不要把它們誤認為現行 3D 架構。

## 素材邊界

- `public/map/map-island-v2.png`／`.webp`：正式 v2 底圖；沿用原圖並合成軟裝家電 icon。
- `public/map/map-whale-keyframe-v1.png`／`.webp`：原始大翅鯨底圖，保留不覆蓋。
- `public/map/map-furnishing-v1.png`／`.webp`：現成軟裝 icon；已烘進 v2 底圖，網頁不重複疊加。
- `public/map/map-sailboat-v2.png`／`.webp`：獨立帆船動畫素材。
- `public/map/map-logo-island-v1.png`／`.webp`：裝修新手島 Logo；Hero 與最終登島區共用，兩處都不可使用 lazy loading。
- `public/map/map-community-v1.png`／`.webp`：右下社群圖示。

除非 Bibo 明確要求，Claude 不要重新生成、替換或覆蓋上述素材。

## 表單、callback 與事件

### 地圖面板

全域入口：`window.dongWuMapCallbacks`

```ts
onEmailUnlockRequest?: (
  stationId: string,
  email: string,
  channel?: string,
  name?: string,
) => boolean | void | Promise<boolean | void>;

onWaitlistRequest?: (
  stationId: string,
  email: string,
  channel?: string,
  name?: string,
) => boolean | void | Promise<boolean | void>;
```

`name` 為後加的第四個參數；若串接既有程式，不要自行調換參數順序。

自訂事件：

- `map:station-view`：`{ stationId, channel }`
- `map:tool-open`：`{ stationId, channel }`
- `map:email-unlock-request`：`{ stationId, name, email, channel }`
- `map:waitlist-request`：`{ stationId, name, email, channel }`
- `map:complete`：`{ channel }`

### 最終登島表單

全域入口：`window.dongWuIslandCallbacks`

```ts
onRegistrationRequest?: (
  name: string,
  email: string,
  channel?: string,
) => boolean | void | Promise<boolean | void>;
```

目前 callback 不存在時只顯示 Demo 完成訊息，不會送出資料。

### localStorage

- `dw-map-v1-visited`
- `dw-map-v1-email-unlocked`

## 社群入口

設定檔：`src/data/islandCommunity.ts`

目前：

```ts
status: 'coming-soon'
href: ''
```

取得 LINE OpenChat 正式網址後，改成 `status: 'open'` 並填入 `href`。不要先填假網址。

## 已完成驗證

- 2026-07-20 執行 `npm.cmd run build` 成功，共產出 29 頁。
- `/island/` client bundle：17.54 kB，gzip 7.32 kB。
- 桌面 1632×912：Hero 兩行、四個階段小標 19.2px，無水平溢出。
- 手機 390×844：Hero 兩行、四個階段小標 16px，無水平溢出。
- 第 04 站免費解鎖表單包含「怎麼稱呼您？」與 Email；未填稱呼會顯示「需要填寫您的稱呼」。
- 14／15／16 站最新座標為 `60/65`、`73/54`、`80/76`；建置後 HTML 已確認舊座標完全移除。以 1672×941 底圖計算，三組中心距離約為 241px、238px、350px。
- 兩處裝修新手島 Logo 的建置後 HTML 已確認為 eager／sync，Hero 另有 high fetch priority；素材本身為 752×357 且雜湊一致。

## 尚未完成

1. LINE OpenChat 正式連結與社群開放狀態。
2. Email／候補／登島表單的正式後端、同意文案、隱私條款與錯誤重送。
3. 05–16 站的正式工具內容與分批上線順序。
4. 正式部署環境的 Lighthouse、Safari、Android Chrome 與完整鍵盤驗收。
5. 分析事件、轉換漏斗與正式資料治理。

## 建置方式

在專案根目錄執行：

```powershell
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 4321
npm.cmd run build
```

不要把本機預覽埠 4174 視為正式設定；那只是 Codex 驗證時使用的暫時埠。

## 交接包邊界

ZIP 是裝修新手島選定檔案的快照，不是 Git commit，也不是懂屋全站備份。包內排除 `node_modules`、`dist`、`.git`、`_tmp` 與其他無關頁面。
