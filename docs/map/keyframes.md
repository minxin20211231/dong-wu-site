# 裝修導航地圖｜Phase 1 Keyframes 與生圖 Prompt

> 生圖由 Bibo 跑既有管線。圖像只負責場景；站名、數字、按鈕、進度與面板一律由 HTML／CSS 疊加。  
> 兩張 keyframe 分別驗證「近景材質與 UI 共存」及「整體路線世界觀」。

## 最終鎖定 Keyframe（2026-07-16）

- 原始視覺底圖：`public/map/map-whale-keyframe-v1.png`（1672 × 941），保留不覆蓋。
- 2026-07-18 網頁載入版：`public/map/map-island-v2.png`／`.webp`（同尺寸），沿用原大翅鯨島形並整合現成軟裝家電 icon。
- 大翅鯨外型、晨曦奶茶色海面、草皮與土地層次均維持確認版，不重新生成島形。
- 16 站編號、目前站、已走訪狀態、流程連線與鎖定狀態由 DOM／CSS 疊加，避免把可變資訊烘焙進底圖。
- 站序依紅字確認稿調整為：鯨頭 01–04 → 背部 05–07 → 尾鰭 08–10 → 海路轉場 → 下方左島 11–13 → 下方右島 14–16；第 16 站沿用現成軟裝家電 icon。
- 10→11 不畫陸橋，改用藍色點狀發光航線與帆船；其餘陸地段維持暖橘色亮燈路徑。

下方 15 站 Prompt 保留為歷史設計過程紀錄，不再用於替換目前 16 站確認底圖。

## 共用參考圖

生成時一併附上：

- `public/ai-diagnosis/assets/character_defender.png`
- `public/ai-diagnosis/assets/character_planner.png`
- `public/ai-diagnosis/assets/character_resource.png`
- `public/ai-diagnosis/assets/character_intuitive.png`
- `public/ai-diagnosis/assets/character_solo.png`
- 鯨魚造型參照：`public/ai-diagnosis/assets/footer_whale.png` 或品牌金色鯨魚 Logo 圖形

## 共用視覺前綴

```text
Premium C4D-style miniature renovation world from the same visual universe as the supplied Dong-Wu homeowner character references. Refined 3D chibi proportions, matte soft vinyl skin and props, smooth rounded bevels, finely knitted fabric texture on clothing, carefully scaled architectural miniatures, warm studio lighting from the upper left, subtle window-shaped volumetric light, shallow but readable depth of field. Warm oat beige, milk-tea beige and caramel-orange palette with dark coffee-brown details and restrained whale-gold accents. Calm, professional, trustworthy Taiwanese home-renovation context. Every object is physically supported and correctly scaled. Clean commercial art direction, one clear focal action, controlled negative space for HTML UI.

STRICTLY FORBIDDEN: NO polymer clay, NO plasticine, NO rough clay grain, NO handmade fingerprints, NO glossy toy plastic, NO mint green, NO pastel pink, NO lavender purple, NO rainbow palette, NO pure black background, NO neon, NO glassmorphism, NO embedded text, NO letters, NO numbers, NO signage, NO watermark, NO UI screenshot, NO distorted hands, NO extra fingers, NO impossible construction detail, NO floating tools unless explicitly requested.
```

---

## Keyframe A｜01 買屋驗屋站完整場景

### 目的

一次驗證人物比例、軟膠材質、建築切面、路線節點、鯨魚引導與右側工具抽屜的共存方式。選 01 站而不是完成屋，是為了先確認最難處理的「未裝修空屋仍要溫暖、不髒亂、不像災難現場」。

### 輸出規格

- 檔名建議：`map-keyframe-s01.webp`
- 原始輸出：1600 × 1000 px，8:5 橫式
- 前端用途：桌機首個到站畫面；不是整頁 Hero 背景
- 構圖安全區：右側約三分之一保持低資訊密度，預留 `StationPanel`；左下保留站名與 CTA 疊字區
- 手機裁切：以人物、牆角裂縫與路線節點為中心，裁成 4:5；右側安全區可捨棄
- WebP 目標：由實際畫質測試後定，不在 Phase 1 虛設檔案大小

### 畫面分層

- 前景：焦糖橘 S 型道路從左下進入，嵌一個無字圓形站台；軟膠鯨魚在道路上方低空引導。
- 中景：守備型屋主站在切開的空屋模型內，以空鼓棒輕敲牆面，另一手拿無字檢查板；牆角只有一條細微髮絲裂縫與一張無字橘色貼紙。
- 背景：半完成水泥空屋、窗格暖光、少量可辨識的柱樑與地坪高低差；不出現完成家具。
- UI 疊加示意：右側深海黑抽屜露出 48px 把手；最右固定 15 格進度軌；UI 不畫進圖片。

### 生圖 Prompt

```text
[共用視覺前綴]

Desktop cinematic keyframe, 8:5 landscape. A three-quarter bird's-eye cutaway miniature of Station 01, a newly purchased empty Taiwanese apartment being inspected before renovation. The supplied defender-type Dong-Wu homeowner character stands inside the open concrete shell and gently taps one wall with a small hollow-wall inspection rod while holding a rounded blank inspection clipboard in the other hand. Show one subtle hairline crack at a wall corner, one small blank caramel-orange inspection sticker, a clean floor-level difference and a simple window opening. The apartment is unfinished but clean and safe, not ruined and not dirty.

A continuous caramel-orange soft-vinyl road curves in from the lower-left foreground and meets one round blank station plinth. A friendly small soft-vinyl Dong-Wu humpback-whale guide floats just above the road and gestures toward the station. Warm upper-left studio light and a soft rectangular window-light shaft define the cutaway walls. Keep the rightmost third calm and low-detail for a dark HTML tool panel overlay; keep the lower-left readable for HTML station title and button. The main action, crack and station plinth must remain visible in a centered 4:5 mobile crop.

ADDITIONAL CONSTRAINTS: unfinished concrete shell only; NO finished sofa, NO bed, NO dining table, NO kitchen cabinetry, NO decorative rug, NO wall art, NO hanging picture, NO catastrophic crack, NO collapsed wall, NO exposed dangerous wiring, NO rubble pile, NO dust cloud, NO printed checklist text, NO readable label.
```

### HTML／CSS 疊加規格

- 左下：`01`、站名、短鉤子與「打開本站工具」；底板只用局部深咖漸層，不放白卡。
- 右側：`StationPanel` 關閉時僅露出窄把手；開啟後佔桌機寬度約三分之一，3D 舞台稍向左重新取景，不做背景模糊。
- 最右：15 格 `ProgressRail`，目前格使用焦糖橘實心，其餘以鯨金描邊。
- 圖內絕不生成 `01`、站名或任何文字。

---

## Keyframe B｜15 站 S 型路線鳥瞰

### 目的

驗證四階段地形、15 站密度、路線辨識度與「一圖兩用」裁切：完整圖供 `/map/` 開場鳥瞰；4:3 版本直接供 `/toolbox/` waitlist 區。

### 輸出規格

- 檔名建議：`map-route-overview.webp`
- 原始輸出：1600 × 1200 px，4:3
- 地圖結構：四條錯位地形帶，站數依序 4／4／4／3；單一路線由上到下連續成 S
- 桌機 `/map/`：可置於 16:9 觀景框中，左右保留裁切空間
- `/toolbox/`：直接使用完整 4:3 圖
- 生產安全做法：AI 先生成場景與 15 個空白基座；站號、名稱與精準點位由 HTML 或 PIL 疊加。若 AI 少站、多站或基座重疊，直接退回，不靠後製硬補場景。

### 四段地形

1. 籌備與規劃：米杏紙張地形，01–04 四個較乾淨的室內模型。
2. 拆改與保護：淺木夾板、橘磚與管線地形，05–08 四站。
3. 裝飾與設備：奶茶木構、板材與暖灰天花地形，09–12 四站。
4. 細節與入住：由月光白轉暖橘夜燈，13–15 三站；15 是視覺終點。

### 生圖 Prompt

```text
[共用視覺前綴]

Top-down three-quarter bird's-eye master keyframe of one continuous miniature Taiwanese home-renovation journey. Build a single clearly readable caramel-orange S-shaped road across four staggered horizontal terrain bands. Place exactly fifteen separate blank round station plinths along the road, grouped 4 + 4 + 4 + 3 from top to bottom. Every plinth is fully visible, evenly spaced and physically connected to the same road. Do not place any number or text on the plinths.

Band 1, four planning stations: a clean empty apartment inspection corner; a lifestyle-needs bubble display; a drafting table where a flat floor plan becomes a small transparent house volume; a wooden meeting table with a calculator and blank contract stamp. Band 2, four construction stations: corridor and floor protection made from LIGHT-COLORED PLYWOOD SHEETS with BROWN KRAFT PAPER TAPE on seams; a controlled demolition wall opening showing orange brick; a compact Taiwanese bathroom waterproofing cutaway; an electrical and plumbing wall cutaway with organized orange conduits and blue water pipes. Band 3, four fit-out stations: ceiling HVAC and red fire-sprinkler routes; a carpentry ceiling frame; a delivery cart and floor-to-ceiling built-in cabinets with HINGED SWING DOORS; a wall being smoothly painted warm beige. Band 4, three finishing stations: one glowing pendant-light installation; one clean inspection scene with flashlight and blank tags; one warmly lit completed home entrance with five supplied homeowner characters and the soft-vinyl whale guide gathered together.

The same small Dong-Wu soft-vinyl humpback-whale guide appears only three times along the route as a recurring navigator, with the largest appearance near the final station. Use environmental cues, not labels. Keep the whole route legible at thumbnail size. Maintain precise model-making order, generous separation, one dominant warm light direction and a calm studio background.

TAIWAN CONSTRUCTION CONSTRAINTS: protection flooring must be pale plywood with brown kraft paper tape; NO green corrugated plastic boards, NO blue or green protection sheets. The compact bathroom may include wall-mounted basin, anti-fog mirror, glass shower partition, wall-hung toilet, niche storage, towel bar and non-slip tile only; NO stool, NO ottoman, NO cushions, NO fabric decor, NO wall art, NO picture frame, NO rug, NO floor plant, NO books. Built-in wardrobe or cabinet doors must be hinged swing doors; NO sliding-door wardrobe, NO freestanding Western wardrobe. All wall decoration, if any, must be abstract geometric line art with NO text, NO calligraphy and NO lettering. NO repeated station, NO missing station, NO merged station, NO floating building, NO readable sign, NO phase title inside the image.
```

### 疊加點位規則

- 15 個 HTML／PIL 圓點按 4／4／4／3 建立，不依賴生圖中的數字。
- `01–04` 初版用實心焦糖橘＋月光白外圈；`05–15` 用奶茶灰階＋鎖定圖示。
- 鎖定圖示、站號、站名與 hover 光暈全部在前端層；底圖不因上線批次重生。
- `/toolbox/` 只顯示鳥瞰縮圖與「搶先登記」，不在縮圖塞入 15 個站名。

## Keyframe 驗收

- [ ] 與五型人物卡同框時，人物比例、膚質、髮絲與針織衣物不衝突。
- [ ] 不出現黏土顆粒、亮面塑膠、馬卡龍色或純黑場景背景。
- [ ] Keyframe A 右側有可用的工具面板安全區，手機裁切仍保留主動作。
- [ ] Keyframe B 可清楚數到 15 個獨立站台，分組為 4／4／4／3，路線不中斷。
- [ ] 浴室、保護工程、衣櫃與牆面畫作符合 AI 生圖空間規格總表。
- [ ] 圖內無文字、數字、招牌、標籤與 watermark。
- [ ] 兩張圖拿掉 UI 後仍像同一個微縮世界，不像兩套不同模型包。
