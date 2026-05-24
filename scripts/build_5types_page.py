"""
build_5types_page.py — 把文欣交付的「五型屋主概覽卡」HTML 轉成 Astro page。
與 build_diagnosis_page.py 同模式。文欣每次交付新版換 SOURCE 後重跑即可。

輸入：懂屋_四型屋主_概覽卡_v1.html（檔名寫四型，內容實際 5 型）
輸出：src/pages/5-types.astro

處理：
1. 提取 head meta（此頁無 description，用預設值）
2. 提取 body + head 內 <style>
3. 路徑替換（概覽卡 assets 中文夾 → /ai-diagnosis/assets/，與診斷書共用同一套圖）
4. <style> → <style is:inline>、<script> → <script is:inline>
5. 包 BaseLayout
"""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "品牌素材" / "文欣交付" / "2026-05-19" / "懂屋_四型屋主_概覽卡_v1.html"
DEST = ROOT / "src" / "pages" / "5-types.astro"

# 概覽卡與診斷書共用 public/ai-diagnosis/assets/ 內同一套角色圖
PATH_REPLACEMENTS = [
    ("懂屋_四型屋主_概覽卡_assets/", "/ai-diagnosis/assets/"),
]


def extract_body(html: str) -> str:
    body_match = re.search(r"<body[^>]*>(.*)</body>", html, re.DOTALL | re.IGNORECASE)
    if not body_match:
        raise ValueError("找不到 body 標籤")
    body = body_match.group(1)

    head_match = re.search(r"<head[^>]*>(.*?)</head>", html, re.DOTALL | re.IGNORECASE)
    if head_match:
        styles = re.findall(r"<style[^>]*>.*?</style>", head_match.group(1), re.DOTALL | re.IGNORECASE)
        if styles:
            body = "\n".join(styles) + "\n" + body

    return body


def strip_internal_notes(body: str) -> str:
    """移除文欣交付檔裡給內部/demo 看的標記，不可洩漏到對外頁。"""
    # DEMO 浮水印
    body = re.sub(r'<div class="page-label">.*?</div>', "", body, flags=re.DOTALL)
    # 「角色圖檔資料夾 / codex CLI 生成」製作備註
    body = re.sub(r'<p class="meta-note">.*?</p>', "", body, flags=re.DOTALL)
    return body


def transform_body(body: str) -> str:
    body = strip_internal_notes(body)

    for old, new in PATH_REPLACEMENTS:
        body = body.replace(old, new)

    body = re.sub(r"<style(\s[^>]*)?>", r"<style is:inline\1>", body)
    body = re.sub(r"<script(\s[^>]*)?>", r"<script is:inline\1>", body)
    body = body.replace("is:inline is:inline", "is:inline")

    return body


def wrap_in_astro(body: str) -> str:
    title = "五型屋主｜你是哪一型裝修屋主"
    desc = "資料控、直覺派、守備型、規劃型、自包派——五種裝修屋主性格，看看你是哪一型，以及最容易卡關的地方。免費 AI 診斷書幫你對號入座。"

    return f"""---
// 自動生成 — 來源：文欣交付 2026-05-19 / 懂屋_四型屋主_概覽卡_v1.html
// 重新生成請跑：python scripts/build_5types_page.py
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
    body = extract_body(html)
    body = transform_body(body)
    astro_content = wrap_in_astro(body)

    DEST.parent.mkdir(parents=True, exist_ok=True)
    DEST.write_text(astro_content, encoding="utf-8")

    print(f"輸出：{DEST}")
    print(f"  size: {len(astro_content):,} 字元")
    # 殘留中文圖片路徑檢查（排除注釋裡的 .html 來源檔名）
    leftover = [p for p in re.findall(r"懂屋_[^\s/'\"]*/", astro_content) if ".html" not in p]
    if leftover:
        print(f"  ⚠ 殘留未替換中文路徑：{set(leftover)}")
    else:
        print("  ✓ 無殘留中文路徑")


if __name__ == "__main__":
    main()
