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


def check_resources(post_id: str) -> dict:
    """驗證上架三件套都存在，回傳 frontmatter dict + 路徑。"""
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
        sys.exit(f"[ERR] 路由不存在：{astro}（依 SOP 6.3 複製範本後改 id）")

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
    args = ap.parse_args()

    if not re.fullmatch(r"D\d{3,}", args.post_id):
        sys.exit(f"[ERR] post_id 格式錯（應為 D### 例 D003）：{args.post_id}")

    print(f"[RUN] publish_post.py {args.post_id}{' [DRY RUN]' if args.dry_run else ''}\n")

    info = check_resources(args.post_id)

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
