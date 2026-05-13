"""dong-wu.com 一鍵上架腳本（SOP Phase 6 機械化部分）。

用法：python scripts/publish_post.py D003
       python scripts/publish_post.py D003 --dry-run    # 只檢查、不 push

對應 SOP Phase 6.5 之後的機械化動作：
  1. 檢查 markdown / 路由 / 首圖三個資源都在
  2. 從 frontmatter 撈 urlSlug + title + draft
  3. git add → commit → push origin main
  4. 等 GitHub Actions 部署完成（gh run watch）
  5. 線上 HTTP 200 + sitemap 含新 URL 驗證
  6. 呼叫 gsc_submit_index.py 提交索引
  7. 印出剩餘人工 checklist（Lighthouse / Bing / llms-full.txt）

不包：Phase 6.1-6.4（內容/設計動作，人工決策）。
"""
import argparse
import io
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

REPO_ROOT = Path(__file__).resolve().parent.parent
DOMAIN = "https://dong-wu.com"
SITEMAP_URL = f"{DOMAIN}/sitemap-0.xml"

ASTRO_ROUTE_TEMPLATE = """---
/*
 * {post_id} — {title_short}
 * URL slug = {url_slug}
 * 自動產生於 publish_post.py（每篇獨立 .astro 繞 Astro 5 + Windows 中括號 bug）
 */
import {{ getCollection }} from 'astro:content';
import PostLayout from '../layouts/PostLayout.astro';

export const prerender = true;

const posts = await getCollection('posts');
const post = posts.find((p) => p.data.id === '{post_id}');
if (!post) throw new Error('Post {post_id} not found in collection');

const {{ Content, headings }} = await post.render();
const tocHeadings = headings.filter((h) => h.depth === 2);
---

<PostLayout
  title={{post.data.title}}
  description={{post.data.description}}
  publishDate={{post.data.publishDate}}
  updateDate={{post.data.updateDate}}
  dim={{post.data.dim}}
  tags={{post.data.tags}}
  heroImage={{post.data.heroImage}}
  heroAlt={{post.data.heroAlt}}
  headings={{tocHeadings}}
>
  <Content />
</PostLayout>
"""


def run(cmd, check=True, capture=True):
    """跑 subprocess，預設 capture stdout/stderr，Windows UTF-8。"""
    print(f"  $ {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    res = subprocess.run(
        cmd,
        cwd=REPO_ROOT,
        capture_output=capture,
        text=True,
        encoding="utf-8",
        errors="replace",
        shell=isinstance(cmd, str),
    )
    if capture and res.stdout:
        for line in res.stdout.rstrip().splitlines():
            print(f"    {line}")
    if capture and res.stderr:
        for line in res.stderr.rstrip().splitlines():
            print(f"    ! {line}")
    if check and res.returncode != 0:
        sys.exit(f"[ERR] command failed: rc={res.returncode}")
    return res


def parse_frontmatter(md_path: Path) -> dict:
    """簡易 frontmatter parser：抓 key: value（不處理巢狀）。"""
    text = md_path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not m:
        sys.exit(f"[ERR] {md_path.name} 沒有 frontmatter")
    fm = {}
    for line in m.group(1).splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, _, val = line.partition(":")
        val = val.strip().strip('"').strip("'")
        fm[key.strip()] = val
    return fm


def generate_route(post_id: str, url_slug: str, title: str, dry_run: bool = False) -> Path:
    """缺路由就自動產生 src/pages/<urlSlug>.astro（純機械動作不需 Bibo 介入）。"""
    astro = REPO_ROOT / "src" / "pages" / f"{url_slug}.astro"
    title_short = title[:20] + ("..." if len(title) > 20 else "")
    content = ASTRO_ROUTE_TEMPLATE.format(
        post_id=post_id, url_slug=url_slug, title_short=title_short
    )
    if dry_run:
        print(f"[DRY] 缺路由，會產生：{astro.relative_to(REPO_ROOT).as_posix()}")
    else:
        astro.write_text(content, encoding="utf-8", newline="\n")
        print(f"[OK] 已產生路由：{astro.relative_to(REPO_ROOT).as_posix()}")
    return astro


def check_resources(post_id: str, dry_run: bool = False) -> dict:
    """驗證/補齊上架三件套，回傳 frontmatter dict + 路徑。"""
    md = REPO_ROOT / "src" / "content" / "posts" / f"{post_id}.md"
    if not md.exists():
        sys.exit(f"[ERR] markdown 不存在：{md}")

    fm = parse_frontmatter(md)
    url_slug = fm.get("urlSlug")
    if not url_slug:
        sys.exit(f"[ERR] {md.name} frontmatter 缺 urlSlug")

    if fm.get("draft", "false").lower() == "true":
        sys.exit(f"[ERR] {md.name} draft=true，先改 false 再上架")

    astro = REPO_ROOT / "src" / "pages" / f"{url_slug}.astro"
    if not astro.exists():
        astro = generate_route(post_id, url_slug, fm.get("title", post_id), dry_run=dry_run)

    hero = REPO_ROOT / "public" / "images" / "posts" / post_id / "hero.jpg"
    if not hero.exists():
        sys.exit(f"[ERR] 首圖不存在：{hero}")

    print(f"[OK] 資源齊備：{post_id} / urlSlug={url_slug}")
    return {
        "fm": fm,
        "md": md,
        "astro": astro,
        "hero_dir": hero.parent,
        "url_slug": url_slug,
        "url": f"{DOMAIN}/{url_slug}/",
    }


# ============================================================
# SEO lint — B0 P0 機械化檢查（對應 SOP/seo_checklist.md §B P0）
# ============================================================

# 列入「空話 / TODO 殘留」黑名單的 heroAlt，命中即 fail
HERO_ALT_BLACKLIST = {
    "示意圖", "image", "img", "todo", "tbd", "首圖", "封面",
    "cover", "圖片", "插圖", "示意",
}

# 內鏈計數時排除外站
EXTERNAL_LINK_PREFIXES = ("http://", "https://", "mailto:", "tel:", "#")

# 直答段字數允許範圍（中文字 + ASCII 字符各算 1）
LEAD_PARA_MIN = 50
LEAD_PARA_MAX = 200  # 放寬到 200（B0-09 原 50-80 太嚴；實務首段常 100-180）

# title / description 長度上限（SEO 慣例）
TITLE_MAX = 60       # 含品牌後綴會超，故只檢 frontmatter 原文
DESC_MIN = 80
DESC_MAX = 160

# 內文圖檔大小上限（KB）— 對應 B0-08
IMG_MAX_KB = 250


def _read_md_body(md_path: Path) -> str:
    """讀 markdown body（去掉 frontmatter）。"""
    text = md_path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n.*?\n---\s*\n", text, re.DOTALL)
    return text[m.end():] if m else text


def _extract_images(body: str):
    """抓 ![alt](url)；回傳 list of (alt, url)。"""
    return re.findall(r"!\[([^\]]*)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)", body)


def _extract_links(body: str):
    """抓 [text](url) 但排除圖片（負向 lookbehind for !）。"""
    return re.findall(r"(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)", body)


def _first_paragraph(body: str) -> str:
    """取第一個非空、非 heading、非 image-only 段落。"""
    for chunk in re.split(r"\n\s*\n", body.strip()):
        chunk = chunk.strip()
        if not chunk:
            continue
        if chunk.startswith("#"):
            continue
        # image-only 段落跳過
        if re.fullmatch(r"!\[[^\]]*\]\([^)]+\)", chunk):
            continue
        return chunk
    return ""


def seo_lint(info: dict) -> None:
    """B0 P0 機械化檢查；任何 ❌ 直接 sys.exit。"""
    fm = info["fm"]
    md_path = info["md"]
    body = _read_md_body(md_path)

    errors: list[str] = []
    warns: list[str] = []

    def ok(code: str, msg: str):
        print(f"  [SEO {code}] ✅ {msg}")

    def fail(code: str, msg: str):
        errors.append(f"[SEO {code}] ❌ {msg}")
        print(f"  [SEO {code}] ❌ {msg}")

    def warn(code: str, msg: str):
        warns.append(f"[SEO {code}] ⚠️  {msg}")
        print(f"  [SEO {code}] ⚠️  {msg}")

    print("\n--- SEO lint（B0 P0）---")

    # B0-01 title 長度（不含品牌後綴）
    title = fm.get("title", "")
    if not title:
        fail("B0-01", "title 缺")
    elif len(title) > TITLE_MAX:
        warn("B0-01", f"title {len(title)} 字 > {TITLE_MAX}（SERP 截斷風險）")
    else:
        ok("B0-01", f"title {len(title)} 字")

    # B0-02 description 長度
    desc = fm.get("description", "")
    if not desc:
        fail("B0-02", "description 缺")
    elif not (DESC_MIN <= len(desc) <= DESC_MAX):
        fail("B0-02", f"description {len(desc)} 字 不在 {DESC_MIN}-{DESC_MAX} 範圍")
    else:
        ok("B0-02", f"description {len(desc)} 字")

    # B0-11 publishDate + updateDate
    if not fm.get("publishDate"):
        fail("B0-11", "publishDate 缺")
    else:
        ok("B0-11", f"publishDate={fm['publishDate']}")
    if not fm.get("updateDate"):
        warn("B0-11", "updateDate 缺（Article Schema dateModified 將 fallback publishDate）")

    # heroAlt 非空話（B0-07 首圖版）
    hero_alt = fm.get("heroAlt", "").strip().lower()
    if not hero_alt:
        fail("B0-07h", "heroAlt 缺")
    elif hero_alt in HERO_ALT_BLACKLIST:
        fail("B0-07h", f"heroAlt 是空話「{fm['heroAlt']}」（黑名單），請寫具體場景")
    else:
        ok("B0-07h", f"heroAlt={fm['heroAlt'][:30]}...")

    # B0-07 內文 img 全帶 alt
    imgs = _extract_images(body)
    if not imgs:
        warn("B0-07", "內文沒有圖片（內容圖通常該有）")
    else:
        missing_alt = [u for a, u in imgs if not a.strip()]
        if missing_alt:
            fail("B0-07", f"{len(missing_alt)} 張圖無 alt：{missing_alt[:3]}")
        else:
            ok("B0-07", f"內文 {len(imgs)} 張圖全有 alt")

    # B0-08 內文圖檔大小
    public_dir = REPO_ROOT / "public"
    oversize = []
    for _alt, url in imgs:
        if url.startswith("/"):
            f = public_dir / url.lstrip("/")
            if f.exists():
                kb = f.stat().st_size / 1024
                if kb > IMG_MAX_KB:
                    oversize.append(f"{url} {kb:.0f}KB")
    if oversize:
        warn("B0-08", f"{len(oversize)} 張圖 > {IMG_MAX_KB}KB：{oversize[:3]}")
    elif imgs:
        ok("B0-08", f"全部圖檔 ≤ {IMG_MAX_KB}KB")

    # B0-09 直答段字數
    lead = _first_paragraph(body)
    lead_len = len(lead)
    if lead_len < LEAD_PARA_MIN:
        fail("B0-09", f"首段 {lead_len} 字 < {LEAD_PARA_MIN}（GEO 引用提取不足）")
    elif lead_len > LEAD_PARA_MAX:
        warn("B0-09", f"首段 {lead_len} 字 > {LEAD_PARA_MAX}（長尾尚可、但可考慮拆段）")
    else:
        ok("B0-09", f"首段 {lead_len} 字")

    # B0-10 內鏈 ≥ 2
    links = _extract_links(body)
    internal = [u for _t, u in links if not u.startswith(EXTERNAL_LINK_PREFIXES)]
    if len(internal) < 2:
        fail("B0-10", f"內鏈只有 {len(internal)} 條（需 ≥ 2，topic cluster）")
    else:
        ok("B0-10", f"內鏈 {len(internal)} 條")

    # B0-06 H1 唯一（content collection 慣例：H1 不在 md 內，由 layout 從 title 產）
    h1_count = len(re.findall(r"^# (?!#)", body, flags=re.MULTILINE))
    if h1_count > 0:
        fail("B0-06", f"md 內出現 {h1_count} 個 H1（H1 應由 layout 從 title 產，md 內只能用 H2+）")
    else:
        ok("B0-06", "md 內無 H1（layout 處理）")

    print(f"--- SEO lint 結果：{len(errors)} fail / {len(warns)} warn ---")

    if errors:
        print("\n[ERR] SEO lint 未通過。修正下列項目，或加 --skip-lint 強跑：")
        for e in errors:
            print(f"  {e}")
        sys.exit(1)


def stage_and_commit(post_id: str, info: dict):
    """git add 三個路徑 + commit。"""
    paths = [
        info["md"].relative_to(REPO_ROOT).as_posix(),
        info["astro"].relative_to(REPO_ROOT).as_posix(),
        info["hero_dir"].relative_to(REPO_ROOT).as_posix(),
    ]
    run(["git", "add", "--", *paths])

    status = run(["git", "status", "--porcelain", "--", *paths], check=False)
    if not status.stdout.strip():
        print("[WARN]  沒有變更要 commit，跳過 commit 步驟")
        return False

    title = info["fm"].get("title", post_id)[:40]
    msg = f"publish: {post_id} {title}"
    run(["git", "commit", "-m", msg])
    return True


def push_and_wait():
    """push + 等 GH Actions 跑完。"""
    run(["git", "push", "origin", "main"])

    print("[WAIT] 等 5 秒讓 GH Actions 註冊 run...")
    time.sleep(5)

    runs = run(
        ["gh", "run", "list", "--workflow=deploy.yml", "--limit=1", "--json", "databaseId,status,headSha"],
        check=False,
    )
    m = re.search(r'"databaseId":\s*(\d+)', runs.stdout or "")
    if not m:
        print("[WARN]  抓不到 run id，手動 gh run list 確認")
        return
    run_id = m.group(1)
    print(f"[GH] follow GH Actions run {run_id}")
    run(["gh", "run", "watch", run_id, "--exit-status"])


def verify_live(info: dict):
    """curl 驗證線上 200 + sitemap 含新 URL。"""
    print(f"[CHK] 驗證 {info['url']}")
    try:
        req = urllib.request.Request(info["url"], method="HEAD", headers={"User-Agent": "publish-post.py"})
        with urllib.request.urlopen(req, timeout=15) as r:
            if r.status != 200:
                sys.exit(f"[ERR] 線上回應 {r.status}")
            print(f"[OK] {info['url']} → 200")
    except Exception as e:
        sys.exit(f"[ERR] HEAD 失敗：{e}")

    try:
        with urllib.request.urlopen(f"{SITEMAP_URL}?_={int(time.time())}", timeout=15) as r:
            sm = r.read().decode("utf-8", errors="replace")
        if info["url"] in sm:
            print(f"[OK] sitemap 含 {info['url']}")
        else:
            print(f"[WARN]  sitemap 尚未含 {info['url']}（CF edge cache 1-2 分鐘，稍後重查）")
    except Exception as e:
        print(f"[WARN]  sitemap 抓取失敗：{e}")


def submit_gsc(info: dict):
    """呼叫 gsc_submit_index.py 提交索引。"""
    print(f"[GSC] 提交 GSC：{info['url']}")
    run(["python", "scripts/gsc_submit_index.py", info["url"]], check=False)


def print_manual_checklist(info: dict):
    print("\n" + "=" * 60)
    print(f"[OK] {info['fm'].get('id', '?')} 上架完成：{info['url']}")
    print("=" * 60)
    print("剩餘人工 checklist（SOP Phase 6.7+）：")
    print(f"  [ ] GSC 後台手動 URL Inspection（保險）：")
    print(f"      https://search.google.com/search-console/inspect?resource_id=sc-domain%3Adong-wu.com&id={info['url']}")
    print(f"  [ ] Bing Webmaster 提交：https://www.bing.com/webmasters")
    print(f"  [ ] Lighthouse 跑 mobile：https://pagespeed.web.dev/analysis?url={info['url']}")
    print(f"  [ ] llms-full.txt 重編（如有變動）")
    print(f"  [ ] 進度總覽更新 + 寫進今日日誌")


def main():
    ap = argparse.ArgumentParser(description="dong-wu.com 一鍵上架腳本")
    ap.add_argument("post_id", help="文章 ID，例：D003")
    ap.add_argument("--dry-run", action="store_true", help="只跑檢查、不 push")
    ap.add_argument("--skip-lint", action="store_true", help="跳過 SEO lint（緊急上架用、留紀錄）")
    args = ap.parse_args()

    if not re.fullmatch(r"D\d{3,}", args.post_id):
        sys.exit(f"[ERR] post_id 格式錯（應為 D### 例 D003）：{args.post_id}")

    print(f"[RUN] publish_post.py {args.post_id}{' [DRY RUN]' if args.dry_run else ''}\n")

    info = check_resources(args.post_id, dry_run=args.dry_run)

    if args.skip_lint:
        print("\n[WARN] --skip-lint 啟用，略過 SEO lint")
    else:
        seo_lint(info)

    if args.dry_run:
        print("\n--dry-run：略過 commit/push/驗證/GSC")
        return

    print("\n--- git stage + commit ---")
    committed = stage_and_commit(args.post_id, info)

    if committed:
        print("\n--- push + 等部署 ---")
        push_and_wait()
    else:
        print("\n(沒有變更，跳過部署等待，直接驗證線上狀態)")

    print("\n--- 線上驗證 ---")
    verify_live(info)

    print("\n--- GSC 索引提交 ---")
    submit_gsc(info)

    print_manual_checklist(info)


if __name__ == "__main__":
    main()
