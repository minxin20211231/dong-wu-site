# 裝修導航地圖｜Phase 3 編譯規格

> 施工目標：`/map/` 是一座可垂直行走的 S 型微縮裝修世界；HTML 永遠保有完整 15 站內容，3D 只負責空間、節奏與方向感。

## 1. Cinematic DNA

| 類別 | 採用項目 | 在本頁的具體做法 | 禁止事項 |
|---|---|---|---|
| 主構圖 | Compositions `#79 Tracking Shot Scroll` | 全視窗舞台固定，頁面滾動推動鏡頭沿同一路徑前進；站點文字從舞台邊緣進場 | 不做一節一張卡、不重置成一般容器 |
| Hero | Hero Archetype `#23 Viewport Fill`＋Visual Element `#31 Frame Border` | Hero 與第一站共享舞台；四角攝影框線和底部壓字建立「模型攝影棚」 | 不做左文右圖 50/50 Hero |
| Hero 字體 | Typography `2.3 Text at Bottom Edge` | H1 壓在觀景框底部，兩行內完成；字是場景的地面錨點，不遮住 S 路線 | 不使用多行超大字堆疊，不把標題嵌進圖片 |
| 進度定位 | Visual Elements `#28 Vertical Accent Line`、`#33 Scroll Indicator` | 桌機右側固定 15 格進度軌；手機顯示目前站與總站數 | 不用遊戲分數、徽章或積分 |
| 主運鏡 | Camera `#13 Bird's-Eye Descent`、`#36 Crab Shot` | 鳥瞰進場後只做靠近、橫移、升降；單段只保留一個主方向 | 不自由旋轉、甩鏡、camera shake |
| 轉場 | Camera `#19 Match Cut`、`#10 Curtain Wipe` | 03 的平面圖對位成立體屋；05、09、13 用地景遮罩作期別換章 | 不靠整頁 opacity 淡入上浮 |
| 深度 | Camera `#33 Parallax Layers` | 10 站只用前景木框、中景站體、遠景路線三層建立深度 | 不使用視差背景球或無限漂浮 |
| 主要互動 | Interaction `#29 Progress Bar`＋自訂 StationPanel | 滾動是唯一重型互動；站點按鈕、畫布點擊與進度軌都呼叫同一份資料 | 不另疊水平滾動、磁性游標或拖曳遊戲 |
| 背景光 | Background `A2 Directional Light` | 左上暖色主光、低方向性環境光、站點工作燈作狀態提示 | 不做彩色漸層光球與玻璃擬態 |
| 質感 | Texture `#1 Fine Film Grain`＋Background `C8 Vignette` | 固定低透明度細顆粒與觀景框暗角，只黏在攝影框內 | 不用刮痕、灰塵雨或老電影抖動 |
| 內文字體 | Quiet Typography `6.1、6.2、6.3、6.7、6.16` | 系統繁中字體、正常字重、有限字寬、較寬行距、次要字降低對比 | 不下載外部字型，不用細到難讀的字重 |
| 字體氣質 | Font Mood `#58 Home Decor Comfort` | 只取溫暖、可親近、居家顧問感；實際仍沿用 `--font-sans` | 不為英文字型氣質犧牲繁中載入與可讀性 |
| 色彩分級 | `Custom / Dong-Wu brand tokens` | 深海黑攝影框、燕麥與奶茶地形、焦糖橘路線、鯨金提示 | 拒絕 Color Grade `#68` 的粉彩電影仿作；不加薄荷綠、粉紅、薰衣草紫 |

設計 DNA 只借用 `advisora` 的暖中性色、圓潤表面與資訊克制；不複製其導覽殼層、頁面結構或動效。電影觀察與 niche 來源完整列在 `decisions.md`。

## 2. 頁面結構

```text
BaseLayout（關閉 BottomNav）
└─ SiteHeader（實色、sticky）
   └─ main.map-page
      ├─ section.map-hero（H1、導讀、開始旅程）
      ├─ div.map-stage-shell（sticky）
      │  ├─ canvas.map-canvas（aria-hidden）
      │  ├─ div.map-static-overview（手機／降動態／失敗替代）
      │  ├─ div.map-frame（四角框、站名、期別、目前進度）
      │  └─ ProgressRail（15 個可鍵盤操作的錨點）
      ├─ div.map-journey
      │  ├─ section#s01 … section#s04（open）
      │  ├─ PhaseGate（Email 解鎖）
      │  └─ section#s05 … section#s15（coming-soon）
      ├─ StationPanel（dialog / drawer）
      └─ footer CTA
```

- 每站都是真實 `<section id="sNN">`，含 H2、hook、期別、狀態、工具摘要與按鈕；canvas 不能持有唯一內容。
- Hero、journey 與 footer 不重複同一種容器。Hero 是場景框；journey 是長卷；footer 才回到品牌 CTA。
- 站點內容由 `src/data/mapStations.ts` 單一來源輸出，DOM、進度軌、面板與 3D `userData.stationId` 共用同一個 id。

## 3. 核心 CSS 規格

```css
:root {
  --map-deep: var(--dw-brand-deep);
  --map-gold: var(--dw-brand-gold);
  --map-orange: var(--dw-brand-orange);
  --map-moon: var(--dw-brand-moon);
  --map-paper: var(--dw-warm-paper);
  --map-oat: var(--dw-warm-oat);
  --map-milk: var(--dw-warm-milk-tea);
  --map-ink: var(--dw-warm-ink);
  --map-muted: var(--dw-warm-muted);
  --map-progress: 0;
  --map-frame-gutter: clamp(12px, 2.2vw, 32px);
}

.map-page { background: var(--map-oat); color: var(--map-ink); }
.map-hero { min-height: 100svh; position: relative; display: grid; align-items: end; }
.map-hero__title {
  max-width: 11ch;
  margin: 0;
  font-size: clamp(3.2rem, 9vw, 8.8rem);
  font-weight: 800;
  line-height: .88;
  letter-spacing: -.065em;
}
.map-stage-shell { position: sticky; top: var(--site-header-height, 0); height: calc(100svh - var(--site-header-height, 0px)); }
.map-canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.map-frame::after { opacity: .018; background-image: url("data:image/svg+xml,...fine-grain..."); }
.map-frame { box-shadow: inset 0 0 10vw rgba(28, 24, 21, .18); }
.map-station { min-height: 92svh; display: grid; align-items: center; pointer-events: none; }
.map-station__copy { pointer-events: auto; width: min(30rem, calc(100% - 3rem)); }
.progress-rail__fill { transform: scaleY(var(--map-progress)); transform-origin: top; }

@media (max-width: 767px), (prefers-reduced-motion: reduce) {
  .map-stage-shell { position: relative; min-height: auto; height: auto; }
  .map-canvas { display: none; }
  .map-static-overview { display: block; }
  .map-station { min-height: auto; padding: 4.5rem 1rem; }
}
```

實作檔的 CSS 可展開細節，但不得改掉：全視窗舞台、底部壓字、固定進度、手機靜態長卷、少於三種圓角尺度、沒有玻璃卡。

## 4. 核心 JavaScript 規格

```ts
const shouldUseStatic =
  matchMedia('(prefers-reduced-motion: reduce)').matches ||
  navigator.connection?.saveData === true ||
  !supportsWebGL();

if (!shouldUseStatic) {
  const [{ createMapScene }, { gsap }, { ScrollTrigger }] = await Promise.all([
    import('./scene'),
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  const scene = await createMapScene(canvas);
  scene.loadPhase(1);
  ScrollTrigger.create({
    trigger: journey,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.55,
    onUpdate: ({ progress }) => {
      scene.setProgress(progress);
      document.documentElement.style.setProperty('--map-progress', String(progress));
      if (progress > .22) scene.loadPhase(2);
      if (progress > .48) scene.loadPhase(3);
      if (progress > .74) scene.loadPhase(4);
    },
  });
}
```

- `loadPhase()` 必須冪等；每期用 dynamic import 建立程序式場景／未來 GLB 掛載點。
- `setProgress()` 只插值 camera position、lookAt 與必要的站點動作，不在 scroll handler 建 geometry。
- panel 開啟時暫停 render loop，關閉才恢復；tab 不可見時停止；context lost 立即切靜態 DOM。
- resize 以 `ResizeObserver` 合併處理；DPR 上限桌機 `1.5`、低階 `1`。
- hover 只改當前站體 scale／工作燈；pointerleave 必須還原。畫布點擊與 DOM 按鈕呼叫同一 panel API。

## 5. 站點節奏與動畫預算

每站共用「對位 → 單軸靠近 → 定格閱讀 → 一個微動作 → 文字卡 → 離站」，但 reveal 依群組輪替：

- 01、09：鳥瞰下降。
- 02、06、11：橫向 tracking。
- 03、12：match cut。
- 04、14：正面定格，只用光線或材質變化。
- 05、07：curtain wipe。
- 08：管線 trace。
- 10：三層 parallax。
- 13、15：燈光 cue。

整頁只有兩個 showy reveal：03 的 2D 圖面變成立體屋、15 的全屋點燈。其餘動效只服務方向與理解。

## 6. 3D 場景與素材規格

- 現階段 demo 用 Three.js 程序式幾何建立霧面軟膠微縮模型，避免等待生圖／建模才可驗證互動。
- 四期各自 dynamic import；未來替換 GLB 時，每期壓縮後模型與貼圖合計不得超過交接書的 `3 MB` 上限。
- 每站一個 `THREE.Group`，只建立一組站體、主道具、單一人物焦點；不建立獨立 renderer。
- 材質共用，幾何可重用；卸載時 traverse dispose 自有 geometry/material/texture。
- 01–04 初始 open；05–15 仍可被看見與滾到，但以低飽和、工作燈熄滅與 `coming-soon` HTML 狀態表達。
- 生圖交付後，`map-keyframe-s01.webp` 與 `map-route-overview.webp` 只作 poster／社群縮圖，不承載文字、號碼與 CTA。

## 7. Email 解鎖與產品邏輯

- 01–04 免費開放。首次開工具面板時顯示 Email 解鎖層；提交成功後在本次瀏覽階段解鎖 01–04。
- demo 階段表單只 dispatch `map:email-unlock-request` 與顯示明確成功狀態，不假裝已連接 MailerLite 或 D1。
- 05–15 點擊後顯示 coming-soon 與登記按鈕，dispatch `map:waitlist-request`；不可因 Email 解鎖就變成已上線。
- callback 介面：`onStationView`、`onToolOpen`、`onMapComplete`、`onEmailUnlockRequest`、`onWaitlistRequest`。

## 8. 無障礙、SEO 與降級

- 所有 15 站由 Astro SSR 成 HTML；canvas `aria-hidden="true"`。
- `ProgressRail` 是 `<nav>`，每格為可聚焦 `<a href="#sNN">`，目前站使用 `aria-current="step"`。
- StationPanel 使用原生 `<dialog>`；關閉後焦點回到觸發按鈕，Esc 可關閉，背景不可鍵盤穿透。
- `prefers-reduced-motion`、Save-Data、無 WebGL、context lost、低 frame pacing 全部切靜態模式；不使用 UA 判斷。
- 靜態模式保留完整路線、期別、站點、Email gate、hash 與 `?ch=` callback；不只是顯示一張海報。
- `/map/#sNN` 必須先把該 section 捲入，再讓 3D（若存在）對位，不阻塞 DOM 導航。

## 9. 驗收門檻

- Production build 成功，無 TypeScript／Astro 錯誤。
- 桌機：滾動過程沒有長時間掉幀；3D 失速時自動退場，不讓資訊跟著失效。
- 手機靜態版：目標 Lighthouse Performance、Accessibility、Best Practices、SEO 皆依交接書門檻驗證。
- 鍵盤：可從「開始旅程」走完進度軌、15 站、Email 表單、面板與 footer；焦點樣式清楚。
- 視覺：1440×900、390×844 與 reduced-motion 三種截圖人工檢查；截圖只放 session 暫存區。
- 網路：確認 Three.js／GSAP 只在 `/map/` 載入，四期場景 chunk 按進度載入，其他頁 bundle 不受影響。

