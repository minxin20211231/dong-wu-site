# 懂屋電子報 + 收信信箱 設定 SOP

> 給 Bibo 自己做的一次性設定，預估 **30–40 分鐘**。做完把最後「給畢寶」那 3 個值貼回來，畢寶就能把診斷書的訂閱表單全線接通。
>
> 順序很重要：**先有自己的網域信箱 → 再驗證寄件身份 → 最後建名單與表單**。照下面 A → B → C → D 一步步來，不要跳。

---

## 為什麼要做這些（30 秒看懂）

訪客在診斷書頁填 email → 完整個人化診斷書**當場在網頁解鎖**（不寄信，因為內容每人不同、由前端即時生成）→ 同時把他加進 MailerLite 名單 → MailerLite 自動寄一封**固定歡迎信**（歡迎 + 預告每週電子報）→ 之後每週寄電子報（預售屋客變 / 新成屋 / 中古屋老屋三主題混寄）。

> ⚠️ **2026-05-24 架構修正**：原設計是「寄 8 頁 PDF」，已改為「網頁解鎖完整版 + 信件只寄歡迎」。診斷書是個人化內容（18 題問卷 → 屋主原型），固定 automation 信寄不出個人化版本，故交付靠網頁解鎖。前端文案「PDF 已寄到信箱」由畢寶改掉。

要讓這條線跑起來，需要三樣東西：

1. **一個你網域的對外信箱** `hello@dong-wu.com`（收訪客回信、當寄件人，比 gmail 專業也比較不會進垃圾桶）
2. **MailerLite 帳號**（管名單、發信、自動信）
3. **三個技術參數**（畢寶把網頁接到 MailerLite 要用）

---

## A. Cloudflare Email Routing — 開 `hello@dong-wu.com`（約 8 分鐘）

讓寄到 `hello@dong-wu.com` 的信，自動轉到你現在在用的 Gmail。

1. 登入 Cloudflare → 左上選網域 **dong-wu.com**
2. 左側選單找 **Email** → **Email Routing**
3. 第一次進來會要你按 **Get started / Enable**，按下去（Cloudflare 會自動幫你加 MX 與 SPF 記錄，按確認）
4. 進到 **Routing rules** → **Custom addresses** → **Create address**
   - Custom address：`hello`
   - Action：**Send to an email**
   - Destination：`dongwu0407@gmail.com`
   - 存檔
5. Cloudflare 會寄一封驗證信到 `dongwu0407@gmail.com` → 去 Gmail 收信按 **Verify**

✅ 完成後，任何人寄到 `hello@dong-wu.com` 的信都會進你的 Gmail。

---

## B. Gmail 設定用 `hello@dong-wu.com` 寄信（約 8 分鐘）

讓你在 Gmail 回信時，對方看到的寄件人是 `hello@dong-wu.com` 而不是你的 gmail。

1. Gmail 右上齒輪 → **查看所有設定** → 分頁 **帳戶和匯入**
2. 找 **以這個地址寄送郵件 (Send mail as)** → **新增另一個電子郵件地址**
   - 名稱：`懂屋 Know Your Home`
   - 電子郵件地址：`hello@dong-wu.com`
   - **取消勾選**「視為別名 (Treat as an alias)」
   - 下一步
3. SMTP 設定這頁，**先別關**。需要 Gmail 的 SMTP：
   - SMTP 伺服器：`smtp.gmail.com`，連接埠 `587`
   - 使用者名稱：你的完整 gmail（`dongwu0407@gmail.com`）
   - 密碼：**要用「應用程式密碼」**，不是你平常登入的密碼
     - 產生方式：Google 帳戶 → 安全性 → 兩步驟驗證（要先開啟）→ 最底下「應用程式密碼」→ 命名「dongwu mail」→ 複製 16 碼貼上
4. 按新增 → Gmail 寄一封驗證碼到 `hello@dong-wu.com`（會經由 A 步驟轉進你 Gmail）→ 收信把驗證碼貼回去

✅ 完成後，Gmail 寫信時寄件人下拉可以選 `hello@dong-wu.com`。

> 這步是「加分項」，主要是讓你手動回訪客信時更專業。**如果卡住可以先跳過**，不影響電子報自動發送（C 步驟才是主線）。

---

## C. MailerLite — 建名單、寄件身份、表單、自動信（約 18 分鐘，主線）

### C-1. 註冊 + 驗證寄件網域

1. 到 **mailerlite.com** 註冊（免費方案 1,000 訂閱者內夠用）
2. 填基本資料時，公司網站填 `https://dong-wu.com`，產業選行銷/設計類都可
3. 進後台 → **Settings → Domains（網域驗證）** → 加入網域 `dong-wu.com`
4. MailerLite 會給你 **3 筆 DNS 記錄**（通常是 SPF、DKIM、Return-path 各一筆，類型多為 TXT/CNAME）
5. 回 **Cloudflare → dong-wu.com → DNS → Records**，把那 3 筆**照抄**新增進去
   - ⚠ 重點：Cloudflare 每筆右邊的 **Proxy status 要設成「DNS only」（灰色雲朵，不是橘色）**，否則驗證不過
   - ⚠ 如果 MailerLite 的 SPF 跟 Cloudflare Email Routing 已加的 SPF 衝突（同一筆 `v=spf1...`），不要建兩筆，要**合併成一筆**，把兩邊的 `include:` 都寫進去。這筆不確定就先拍照貼給畢寶幫你合。
6. 回 MailerLite 按 **Verify**（DNS 生效可能要等幾分鐘到 1 小時）

### C-2. 建名單 Group

1. **Subscribers → Groups → Create group**
2. 名稱：`懂屋_AI診斷書`
3. 存檔

### C-3. 建表單 Form（拿 Form ID 用）

1. **Forms → Embedded forms → Create new form**
2. 名稱：`診斷書訂閱`
3. 指定加入剛建的 group `懂屋_AI診斷書`
4. 欄位保留 email 即可（其他可刪）
5. 存檔 → 進到「拿程式碼 / Get code」那頁不用真的貼，**只要記下網址或程式碼裡的一串數字 Form ID**（畢寶要用）

### C-4. 建自動信 Automation（訂閱後自動寄「歡迎信」）

> 2026-05-24 改：這封**不是**診斷書（診斷書在網頁已解鎖），是「歡迎信 + 每週電子報預告」。固定內容、人人相同。

1. **Automations → Create new automation**
2. 名稱：`懂屋電子報 歡迎信`
3. 觸發條件 Trigger：**When subscriber joins a group → 選 `懂屋_AI診斷書`**
4. 動作 Action：**Send email**
   - 主旨先暫填：`歡迎加入懂屋｜每週一封裝修知識信 🐳`
   - 內文**先留空或隨意**，正式文案（歡迎語 + 每週三主題預告：預售屋客變/新成屋/中古屋老屋 + 回診斷書頁連結）之後由畢寶幫你寫好再貼進來
5. 先存成草稿即可，**暫時不要 Activate**（等信件內容做好再開）

---

## D. 把 3 個值交給畢寶（最後一步）

在 MailerLite 後台找到以下 3 個值，貼回對話給畢寶：

| 要找的東西 | 在哪裡找 |
|---|---|
| **API Token** | Settings → Integrations → API → Generate new token（複製整串，只會顯示一次） |
| **Group ID**（`懂屋_AI診斷書`） | 點進該 group，網址列尾端那串數字 |
| **Form ID**（`診斷書訂閱`） | C-3 記下的那串數字 |

> ⚠ **API Token 等於你 MailerLite 的鑰匙，不要貼到公開的地方**。貼給畢寶後，畢寶會把它鎖進 Cloudflare Worker 的環境變數，不會出現在網頁原始碼裡。

---

## 畢寶收到後會做的事（你不用管，列出來讓你知道進度）

1. 部署一支 **Cloudflare Worker**（薄代理），網頁把 email 送給 Worker、Worker 才拿 API Token 去呼叫 MailerLite —— 這樣 Token 不會在前端外洩
2. 把 Worker 網址填進 `src/pages/ai-diagnosis.astro` 的 `MAILERLITE_CONFIG.endpoint`
3. **改前端文案**：把診斷書頁寫死的「PDF 已寄到信箱 / 8 頁完整 PDF」改成「完整版已在下方解鎖 + 歡迎信已寄到信箱」（4494、4495、4828 行附近）
4. 設計**歡迎信**版型（歡迎語 + 每週三主題預告 + 回診斷書頁連結 + 追蹤社群 CTA）
5. 部署網站、實測填一次 email 確認真的收到歡迎信，再請你把 C-4 的 Automation 按 **Activate**

---

## 完成檢查清單

- [ ] A. `hello@dong-wu.com` 寄信能轉進 Gmail（自己寄一封測試）
- [ ] B.（加分）Gmail 可用 `hello@dong-wu.com` 當寄件人
- [ ] C-1. MailerLite 網域驗證通過（顯示 Verified / 綠勾）
- [ ] C-2. Group `懂屋_AI診斷書` 已建
- [ ] C-3. Form `診斷書訂閱` 已建
- [ ] C-4. Automation 草稿已建（先不啟用）
- [ ] D. 把 API Token / Group ID / Form ID 貼給畢寶
