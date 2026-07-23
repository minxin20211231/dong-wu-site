# 裝修新手島｜改版記錄（2026-07-17）

原「裝修導航地圖」計畫由 Bibo 決定改為「**裝修新手島**」。本檔記錄改版決策與 Phase 1 變更，接續 `CLAUDE_HANDOFF_2026-07-17.md`（該檔為改名前的歸檔快照，不再更新）。

## Bibo 已決定（覆蓋交接書的舊決策）

- 計畫名：裝修新手島。Slogan：「把裝修給導航，讓新手也能走成一條路」。
- URL：`/island/`，`/map/` 以 301 轉址（覆蓋交接書「URL 使用 /map/」一項）。
- 入島機制＝雙門並行：Email 快速入島解鎖前四站工具；填 AI 診斷書拿職業卡、解鎖屋主類型差異化內容。
- 檢查卡＋圖鑑系統：過站掉落檢查卡、收進圖鑑、頁面先送 2–3 張真卡；**不分稀有度**（守住規格「不用遊戲分數／徽章／積分」）。
- 對標分析（AI 新手村 madebypan.com/learn-ai-map）五項採納：痛點三格區、四步驟玩法區、候補表單加「最想先解鎖哪一站」、FAQ 登島指南＋白話隱私承諾、「一站 X 分鐘」時間承諾（數字待工具規模定案）。
- 明確不做：代幣／資源兌換、訂閱制分層、跨裝置帳號進度。

## 站數 15→16（2026-07-17 晚間追加）

- Bibo 決定加「軟裝家電站」（軟裝、家具、家電）：插在 14 清潔驗收之後，新編號 15；幸福入住改為 16、維持終站。第四階段變 13–16（四階段 4/4/4/4）。
- 新站 `mapPosition (68,70)` island 6，落在既有 return 路線 SVG 上，路線不需改。
- `bootstrap.ts` 去硬編碼：returnProgress 分母改 `mapStations.length - 11`、mapComplete 觸發改最後一站 id。
- 全站「十五站／15」字樣已同步改十六（island.astro、MapStage、toolbox 16 STOPS）。
- 新站微縮物件（沙發＋迷你冰箱＋立燈＋紙箱、圓形站台）走 codex gpt-image-1 生透明素材，做法同帆船 `map-sailboat-v2`；prompt 存 `000_Agent/skills/dongwu-cover-image/prompts/island16_codex_prompt.txt`。

## Phase 1 變更清單（本次）

- `src/pages/map.astro` → `src/pages/island.astro`；`public/_redirects` 加 `/map`、`/map/` → `/island/` 301。
- title／description／OG、hero topline、H1（slogan 兩行）、hero 說明句改為 keyframe 現況描述。
- 新增三區塊（地圖與 outro 之間）：痛點三格、玩法四步驟（登島／走站／開工具／帶進現場）、FAQ 登島指南 5 題＋FAQPage JSON-LD。樣式在 `map.css` 尾段 `island-*` 類，無白色圓角卡。
- 「裝修導航地圖」字樣清理：ProgressRail／MapStage aria-label、toolbox 頁 waitlist 區改「裝修新手島・登島預約」＋按鈕「預約登島」（對齊工具箱 v2 定案）。

## 待後續 Phase

- Phase 2：漏斗接線（session_id、callbacks 接 Worker、`/track` 加島事件、Email 門接 `/subscribe`、表單加題、戰利品區 2–3 張真卡）。
- Phase 3：診斷書 session 串接＋職業卡。
- Phase 4：檢查卡全量＋圖鑑頁；玩法第三步「開工具」屆時改「收卡」。
- 上線前驗收債：部署環境 Lighthouse mobile、iPhone Safari／Android Chrome 真機、鍵盤完整操作。
