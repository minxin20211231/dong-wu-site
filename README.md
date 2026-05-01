# 懂屋 Know Your Home — dong-wu.com

裝修知識庫品牌站，主打「你必須要知道的所有裝修知識都在這裡」。

## 技術組合

- **Astro 5.x**（內容導向靜態站框架）
- **Cloudflare Pages**（部署/CDN/SSL，免費）
- **Cloudflare DNS**（dong-wu.com 已就緒）
- 內容：Markdown + Astro Content Collection
- 視覺規範：`懂屋KYH/品牌素材/懂屋_色票卡_DEFINED_v1.html`（design.md 視覺實體）

## 開發指令

```bash
npm install      # 第一次安裝套件
npm run dev      # 本地開發（http://localhost:4321）
npm run build    # 產出靜態檔到 dist/
npm run preview  # 預覽 build 結果
```

## 部署流程

1. 推到 GitHub `main` 分支
2. Cloudflare Pages 自動偵測、自動 build、自動上線
3. 約 1-2 分鐘後 dong-wu.com 看到變更

## 目錄結構

```
dong-wu-site/
├── src/
│   ├── layouts/        # 主版型
│   ├── pages/          # 路由頁面
│   ├── content/        # Markdown 文章（Content Collection）
│   └── styles/         # 全站 CSS（色票來源 = design.md）
├── public/             # 靜態資源（favicon、圖片）
└── astro.config.mjs    # Astro 設定
```

## 內容生產原則

- 每篇文章 = `src/content/posts/<id>.md`
- 標題、分類、來源書 metadata 跟 `懂屋KYH/MVP工具包/03_AI診斷書/kyh_qa_all.json` 對齊
- 寫作風格遵循 `human-writing-style` skill（去 AI 感）
- 視覺自動套用 design.md，文章內不重新刻設計

## 相關文件

- 完整計劃書：`000_Agent/plans/2026-05-01-懂屋官網上線.md`
- 品牌視覺規範：`懂屋KYH/品牌素材/懂屋_品牌視覺規範_DEFINED_v1.0.md`
- 375 題問答庫：`懂屋KYH/MVP工具包/03_AI診斷書/kyh_qa_all.json`
- 電子書素材：`懂屋KYH/電子書｜新成屋導航手冊/`
