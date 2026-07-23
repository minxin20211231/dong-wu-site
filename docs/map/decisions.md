# 裝修導航地圖｜Phase 1 設計決策

> 狀態：Phase 1 已完成並經後續視覺確認；Phase 2、Phase 3 已依確認結果完成 Demo。  
> 最終視覺基準：`public/map/map-whale-keyframe-v1.png`，維持大翅鯨島鏈外型，以 HTML／CSS 疊加 15 站順序與互動狀態。

## 起始條件

- 起始模式：以現有五型人物卡、`/ai-diagnosis/` 與 `/toolbox/` 作視覺參照，再重新編排成獨立場景。
- 類型：動畫式微縮世界、互動地圖、裝修教育旅程。
- 導演語言（工作選擇）：Wes Anderson。
- 電影語言（工作選擇）：《Isle of Dogs》。
- 產業／主題：台灣住宅裝修流程教育與工具入口。
- 頁面：單頁 `/map/`，含 `#s01`～`#s15` 直達錨點。
- 主要頁面角色：互動地圖長卷、站點工具面板、Email 解鎖、coming-soon 登記。
- 圖像占位：需要。Codex 交付版型規格與 prompt，Bibo 執行生圖管線。
- 已確認產品決策：`/map/`、初版免費＋Email 解鎖、第一階段 4 站先開且其餘分站上線。

## 電影選擇檢核

### 這部電影替本專案解決的具體問題

本頁需要把 15 個內容差異很大的裝修站點放進同一條可辨識、可行走、可停靠的路線。《Isle of Dogs》的工作價值不是「可愛」，而是把大量角色、道具、地點整理成可讀的平面式舞台，並以手工模型材質和精準橫移維持秩序。這正好對應「複雜流程不做成資訊卡堆，而做成一個能一路走完的微縮世界」。

### 是否可無差別套用到其他產業

不直接套用。這個選擇成立，是因為本專案同時需要：微縮模型、實體路線、群像角色、逐站停靠與四段式旅程。若只是一般品牌首頁或 SaaS 產品頁，這套電影語言不會自然成立。

### 是否只借用電影名氣

不借用電影標誌、角色、字體或配色，也不把電影名稱露出在 UI。只轉譯以下可操作特徵：平面式取景、模型舞台、精準停格、橫向追蹤與物件被刻意擺放的秩序感。攝影與美術訪談已支持這些觀察；正式 prompt 仍只寫可控特徵，不寫導演名作風格捷徑。

## 前作差異化稽核

### Previous-work audit

`/toolbox/` 目前的主要骨架是：左側文案、右側人物／工具箱視覺；後續使用白色或暖色大圓角卡片、雙欄區塊、三欄工具卡與統一淡入上浮。它適合名單轉換頁，但若直接沿用到地圖，會變成「把 15 站塞進卡片」而失去旅程感。

### 本頁禁止沿用的殼層

- 禁止左文右圖的 50/50 Hero。
- 禁止用 15 張大圓角白卡當主體。
- 禁止三欄或 2×2 產品行銷格線。
- 禁止每一站都用同一種 `opacity + translateY` 淡入。
- 禁止用 pill 標籤、玻璃卡、漸層光球替代場景構圖。
- 禁止把五型人物排成工具箱頁同款的中心群像 Hero。
- 禁止全頁每段都回到固定最大寬度容器。

### Primary composition family

**縱向剖切地景長卷（vertical cutaway atlas ribbon）**：整頁是一條由上到下延伸的 S 型微縮地景；桌機視窗像攝影棚觀景框，鏡頭沿路線推進，每站是一個被切開、可從三分之四角度觀看的模型舞台。DOM 文案與控制列固定在舞台邊緣，不把 3D 場景切碎成卡片。

### Wireframe-level uniqueness test

把顏色、人物與材質全部拿掉後，本頁仍應看得到：全視窗舞台、連續 S 型路線、固定 15 格進度軌、四次地形門檻、逐站停靠與右側工具抽屜。若拿掉視覺後只剩「Hero＋卡片列表＋CTA」，即判定失敗。

## 參照拆解

- 參照 A｜五型人物卡：只取大頭身比例、柔和棚拍光、針織衣料、奶茶米杏色溫與表情尺度。
- 參照 B｜`/toolbox/`：只取品牌 tokens、Email 表單語氣與五型人物資產，不取左右分欄 Hero、三欄卡片或統一圓角殼層。
- 參照 C｜既有 `toolbox-route-map.webp` prompt：只取 15 站、四階段、S 型路線與鯨魚導航的功能需求；鳥瞰構圖改為 4／4／4／3 的地形帶，避免三列五格像桌遊盤。
- 不複製：電影美術、電影角色、電影片名字樣、工具箱既有區塊順序、診斷頁既有頁殼。

## 研究邊界

- 電影研究是觀察輸入，不是元件規格。
- 會轉成網站語言的內容：取景秩序、鏡頭節奏、材質感、停靠方式、章節式轉場。
- 不會轉成網站語言的內容：電影劇情、角色造型、標誌、片名字體、可辨識場景複製。
- 導演／攝影來源：[Stop-Motion Cinematography: Q&A With ‘Isle of Dogs’ DOP Tristan Oliver｜Cartoon Brew](https://www.cartoonbrew.com/feature-film/isle-of-dogs-cinematography-tristan-oliver-157383.html)、[Tristan Oliver BSC / Isle Of Dogs｜British Cinematographer](https://britishcinematographer.co.uk/tristan-oliver-bsc-isle-of-dogs/)。
- 美術／道具來源：[Production Designer Paul Harrod on Building Wes Anderson’s Isle of Dogs｜Motion Picture Association](https://www.motionpictures.org/2018/03/production-designer-paul-harrod-building-wes-andersons-isle-dogs/)、[Graphic Designer Erica Dorn Sweats the Details for Wes Anderson’s Isle of Dogs｜Motion Picture Association](https://www.motionpictures.org/2018/04/graphic-designer-erica-dorn-sweats-the-details-for-wes-andersons-isle-of-dogs/)。
- 分鏡／節奏來源：[Storyboarding in Isle of Dogs｜ACMI](https://www.acmi.net.au/works/100629--storyboarding-in-isle-of-dogs/)。
- 目前本機來源：交接書、五型人物 PNG、`src/styles/global.css`、`src/pages/toolbox.astro`、`docs/toolbox-image-prompts.md`、cinematic-ui 本機資料庫。

### 電影研究轉譯

- Framing：攝影訪談描述嚴格對稱、依格線配置與物件間留空；網站轉成近正交的正面／三分之四模型舞台，不做斜角自由飛行。
- Rhythm：主要運鏡沿左右或上下單軸移動；網站每站採「進場、定格閱讀、單一微動、離站」，不把位移、旋轉與縮放同時疊滿。
- Lighting：外景偏低方向性、接近平光，讓觀者自行巡視細節；網站用大面積柔光，窗光與工作燈只負責狀態提示。
- Space：製作以強制透視與多種模型尺度擴張有限片場；網站以前景工具、中景主站、遠景前後站建立深度，不靠超廣角扭曲。
- Materiality：微型文件與道具具備真內容；網站讓圖面、樣本、檢查表與章印成為可放大的細節，但重要資訊仍留在 HTML。
- Scroll animatic：ACMI 的分鏡資料支持先用 animatic 鎖時間；Phase 2 先以 01–04 的滾動節奏測試，再鋪滿後 11 站。

### Niche 參照

- [#MetKids｜The Metropolitan Museum of Art](https://www.metmuseum.org/art/online-features/metkids/explore)：取「鳥瞰 home base、站點直接落在地圖、篩選後仍保留全圖關係」；不取兒童塗鴉密度與原樓層插畫。
- [Oat the Goat｜Assembly](https://oatthegoat.assemblyltd.com/)：取「章節抽屜、旅程中隨時定位、不同觀看模式與替代出口」；不取兒童故事語氣、角色、音訊與道德選項。
- [Dive into Intangible Cultural Heritage｜UNESCO](https://ich.unesco.org/dive/)：取「同一內容可依不同維度重看，無關節點淡化但不消失」；不取星群粒子造型，也不打散裝修先後順序。

### 不可複製的文化／電影符號

- 不使用電影角色、犬隻、垃圾島、機器犬、壽司場景或相同站景。
- 不照搬日文嵌字、浮世繪、神社、太鼓等日本文化符號；場景材料全部回到台灣裝修現場。
- 不複製精確電影配色、字體或鏡頭序列；品牌 tokens 仍是色彩唯一來源。
- 對稱只服務導航與閱讀，不能犧牲手機版文字、按鈕、SEO 或可及性。

## 風格定調

### 一句話視覺主張

把裝修順序做成一座暖色微縮攝影棚：每次滾動不是切換區塊，而是沿同一條路走進下一個施工現場。

### 色彩 tokens

沿用目前 `global.css` 的既有品牌與暖色層，不新增第二套近似色：

```css
:root {
  --map-brand-deep: var(--dw-brand-deep);        /* #1C1815 */
  --map-brand-gold: var(--dw-brand-gold);        /* #B8977E */
  --map-brand-orange: var(--dw-brand-orange);    /* #D4886A */
  --map-brand-moon: var(--dw-brand-moon);        /* #F5F0E8 */
  --map-warm-paper: var(--dw-warm-paper);        /* #FFFDF8 */
  --map-warm-oat: var(--dw-warm-oat);            /* #EFE6DA */
  --map-warm-milk-tea: var(--dw-warm-milk-tea);  /* #D9C4AB */
  --map-warm-ink: var(--dw-warm-ink);            /* #3A2E26 */
}
```

### 構圖規則

- 桌機以接近正交投影的三分之四俯角為主，避免廣角變形與遊戲鏡頭暈眩。
- 每站只保留一個主動作、一個主道具、一個角色焦點；其餘作為安靜布景。
- 路線永遠可辨識，但不必每個畫面都看到整條 S。
- 所有站點文字、數字、按鈕與工具內容都由 HTML 疊加，圖內禁止文字。
- 深海黑只用於品牌框、抽屜與進度軌，不把整個微縮世界壓成暗色頁。

### 材質規則

- 人物與道具：霧面軟膠、圓潤去角、衣物可見細緻針織紋理。
- 建築與地形：細緻霧面模型表面，可有微量石材／木材差異，但禁止黏土顆粒與指紋。
- 光源：左上或側上方柔和棚燈，加少量窗格體積光；同一畫面只留一個主光向。
- 邊緣：以實體模型倒角和接縫製造層次，不用玻璃擬態、霓虹或大量外發光。

## 高級感校準

- 3 秒記憶點：一條真的能走進去的 S 型微縮裝修世界。
- 刻意缺席：卡片牆、粒子特效雨、遊戲化積分、浮誇鏡頭旋轉。
- 精緻來源：一致光向、模型比例、停靠節奏、畫面留白與單一焦點。
- 若刪除 30% 動效：頁面應更安靜但仍成立；不能靠特效才看得懂。
- Grid fallback test：若改成 15 張卡，會失去路線連續性、站點先後關係、四段地形轉場與「走完一趟」的身體感，因此不可降格為卡片格線。

## Phase 1 鎖定與未鎖定

### 已鎖定

- 頁面殼層：縱向剖切地景長卷。
- 影像材質：C4D 3D 霧面軟膠微縮模型。
- Hero 骨架：Framed Viewport，進場後觀景框擴張為全視窗地圖舞台。
- 內容策略：地圖與站名免費可看；第一次開啟可用工具時觸發一次 Email 解鎖。
- 初版狀態：01–04 `open`，05–15 `coming-soon`。
- 導演／電影轉譯：Wes Anderson／《Isle of Dogs》的平面構圖、單軸運鏡、模型尺度與停格節奏；外部來源已複核。

### 技術實測已鎖定

- 正式版採 `Three.js 0.185.1 + GSAP 3.15.0 / ScrollTrigger`。
- 隔離 production build：Three.js＋GSAP 為 `628,724 B raw / 171,640 B gzip`；Spline＋GSAP 全部署 JS 為 `4,667,214 B raw / 1,488,349 B gzip`。
- Headless Edge 無正式場景初始化中位數：Three.js＋GSAP `162.0 ms`，Spline＋GSAP `322.2 ms`。這只比較 runtime 基礎成本，不當作正式場景 FPS。
- 完整量測、限制與重現方式記錄於 `tech-selection.md`；原始結果位於 session 暫存區 `C:\tmp\map-tech-benchmark\`。
