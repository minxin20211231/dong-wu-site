"""
build_diagnosis_page.py — 把文欣交付的診斷書 HTML 轉成 Astro page。
文欣每次交付新版（v12, v13...），把新 HTML 換到 SOURCE 路徑後重跑即可。

輸入：懂屋_診斷書_v11-1.html
輸出：src/pages/ai-diagnosis.astro

處理：
1. 提取 head 內的 title / description / og 等 meta → BaseLayout props
2. 提取 body 內容
3. 路徑批次替換（懂屋_XXX 中文資料夾 → /ai-diagnosis/英文資料夾）
4. <style> → <style is:inline>、<script> → <script is:inline>
5. 包 BaseLayout

⚠️⚠️ 重跑會覆蓋以下「Email Gate 改造」——這些不在來源 HTML，是手動加在 .astro。
   重跑後必須手動補回，否則訂閱功能失效：
   a. MAILERLITE_CONFIG.endpoint = 'https://dongwu-subscribe.minxin20211231.workers.dev'
   b. subscribeEmail() 函數 + submitEmailGate/submitEmailReminder 內的 subscribeEmail 呼叫
   c. email gate / reminder banner 文案：「我寄了一封歡迎信到…（含 20 項清單）」（非「PDF 已寄到信箱」）
   d. 移除結果頁「✉ 重寄到信箱」按鈕 + resendDiagnosis 函數
   詳見 100_Todo/懂屋電子報訂閱_接通清單.md
"""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "品牌素材" / "文欣交付" / "2026-05-19" / "懂屋_診斷書_v11-1.html"
DEST = ROOT / "src" / "pages" / "ai-diagnosis.astro"

# 路徑替換規則（中文資料夾 → public 內英文路徑）
PATH_REPLACEMENTS = [
    ("懂屋_四型屋主_概覽卡_assets/", "/ai-diagnosis/assets/"),
    ("懂屋_頭像_v11/", "/ai-diagnosis/avatars/"),
    ("懂屋_風格圖_v11/", "/ai-diagnosis/styles/"),
]


def extract_meta(html: str) -> dict:
    """從 head 提取 title / description / og 等。"""
    def grab(pattern: str, default: str = "") -> str:
        m = re.search(pattern, html, re.IGNORECASE)
        return m.group(1).strip() if m else default

    return {
        "title": grab(r"<title>(.*?)</title>"),
        "description": grab(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']'),
        "og_title": grab(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']+)["\']'),
        "og_description": grab(r'<meta\s+property=["\']og:description["\']\s+content=["\']([^"\']+)["\']'),
    }


def extract_body(html: str) -> str:
    """提取 <body> 與 </body> 之間的內容 + head 內的 <style>（移到 body 開頭）。"""
    body_match = re.search(r"<body[^>]*>(.*)</body>", html, re.DOTALL | re.IGNORECASE)
    if not body_match:
        raise ValueError("找不到 body 標籤")
    body = body_match.group(1)

    # 從 head 撈所有 <style> 區塊（diagnosis HTML 把 CSS 寫在 head）
    head_match = re.search(r"<head[^>]*>(.*?)</head>", html, re.DOTALL | re.IGNORECASE)
    if head_match:
        styles = re.findall(r"<style[^>]*>.*?</style>", head_match.group(1), re.DOTALL | re.IGNORECASE)
        if styles:
            body = "\n".join(styles) + "\n" + body

    return body


def transform_body(body: str) -> str:
    """路徑替換 + is:inline 標記 + JSX escape。"""
    # 路徑替換
    for old, new in PATH_REPLACEMENTS:
        body = body.replace(old, new)

    # <style> / <script> 加 is:inline（避免 Astro 處理 5000+ 行 CSS/JS）
    body = re.sub(r"<style(\s[^>]*)?>", r"<style is:inline\1>", body)
    body = re.sub(r"<script(\s[^>]*)?>", r"<script is:inline\1>", body)
    # 避免重複 is:inline
    body = body.replace("is:inline is:inline", "is:inline")

    return body


def wrap_in_astro(body: str, meta: dict) -> str:
    """包成 .astro 檔。"""
    # BaseLayout 會自動加「｜懂屋 Know Your Home」後綴，所以這裡傳短 title
    title = "免費 AI 裝修診斷書"
    desc = meta["description"] or "回答 18 個問題，5 分鐘獲得專屬裝修診斷書。"

    return f"""---
// 自動生成 — 來源：文欣交付 2026-05-19 / 懂屋_診斷書_v11-1.html
// 重新生成請跑：python scripts/build_diagnosis_page.py
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout
  title="{title}"
  description="{desc}"
  image="/ai-diagnosis/assets/logo_gold.png"
  imageAlt="懂屋 Know Your Home"
>
{body}
</BaseLayout>
"""


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(f"找不到來源 HTML: {SOURCE}")

    html = SOURCE.read_text(encoding="utf-8")
    meta = extract_meta(html)
    body = extract_body(html)
    body = transform_body(body)
    astro_content = wrap_in_astro(body, meta)

    DEST.parent.mkdir(parents=True, exist_ok=True)
    DEST.write_text(astro_content, encoding="utf-8")

    print(f"輸出：{DEST}")
    print(f"  title: {meta['title']}")
    print(f"  size: {len(astro_content):,} 字元")
    print("\n⚠️  已覆蓋 Email Gate 改造！必須手動補回 a-d（見本檔開頭 docstring）")
    print("    否則訂閱失效：endpoint 變空、文案回「PDF」、resend 按鈕復活")


if __name__ == "__main__":
    main()
