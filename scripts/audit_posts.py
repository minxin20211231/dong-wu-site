"""文章歸檔完整度健檢（folder_naming.md v2 的檢查工具）。

對每篇 Astro 文章（src/content/posts/D###.md）檢查 365QA 本地歸檔：
  [FAIL] 缺 365QA/posts/D###-中文短摘/ 資料夾
  [FAIL] 缺 規劃筆記.md
  [FAIL] 缺 終稿草稿.md，或內容與 Astro 檔漂移（修法：sync_drafts.py D###）
  [FAIL] 缺 images/hero.jpg
  [FAIL] 站上 public/images/posts/D###/ 有、本地歸檔沒有的圖（歸檔漏，D010 踩坑）
  [WARN] 缺 初稿.md（D014 起必有；歷史篇不回補、不可事後編造，僅提示）
  [WARN] 缺 _proofread_report.md（D014 起必有）
  [WARN] 殘檔：.bak、與 webp 同名並存的 png（D006/D007 踩坑）
  [WARN] Astro 檔 draft:true（半成品掛在站上 repo，對照規劃筆記「狀態」欄）

用法：
  python scripts/audit_posts.py           # 全部
  python scripts/audit_posts.py D014      # 單篇（publish_post.py 上稿時自動跑這個模式）

Exit code：有 FAIL → 1，否則 0（WARN 不影響）。
"""
import argparse
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

REPO_ROOT = Path(__file__).resolve().parent.parent            # dong-wu-site/
POSTS_DIR = REPO_ROOT / "src" / "content" / "posts"
PUBLIC_IMG = REPO_ROOT / "public" / "images" / "posts"
DRAFT_ROOT = REPO_ROOT.parent / "365QA" / "posts"

# 初稿/_proofread_report 從這篇起列必有（歷史篇僅 WARN，不回補避免事後編造）
DRAFT_REQUIRED_SINCE = 14


def find_draft_dir(post_id: str) -> Path | None:
    hits = sorted(p for p in DRAFT_ROOT.glob(f"{post_id}-*") if p.is_dir())
    return hits[0] if hits else None


def audit_one(astro_md: Path) -> tuple[list[str], list[str]]:
    """回傳 (fails, warns)，訊息不含篇號前綴。"""
    post_id = astro_md.stem
    post_num = int(post_id[1:])
    fails: list[str] = []
    warns: list[str] = []

    draft_dir = find_draft_dir(post_id)
    if draft_dir is None:
        return ([f"缺 365QA/posts/{post_id}-中文短摘/ 資料夾"], [])

    # --- 必有檔案 ---
    if not (draft_dir / "規劃筆記.md").exists():
        fails.append("缺 規劃筆記.md")

    target = draft_dir / "終稿草稿.md"
    if not target.exists():
        fails.append(f"缺 終稿草稿.md（修法：python scripts/sync_drafts.py {post_id}）")
    elif target.read_text(encoding="utf-8") != astro_md.read_text(encoding="utf-8"):
        fails.append(f"終稿草稿.md 與 Astro 檔漂移（修法：python scripts/sync_drafts.py {post_id}）")

    if not (draft_dir / "images" / "hero.jpg").exists():
        fails.append("缺 images/hero.jpg")

    # --- D014 起必有（歷史篇 WARN） ---
    level = fails if post_num >= DRAFT_REQUIRED_SINCE else warns
    if not (draft_dir / "初稿.md").exists():
        level.append("缺 初稿.md" + ("" if post_num >= DRAFT_REQUIRED_SINCE else "（歷史篇、不回補）"))
    if not (draft_dir / "_proofread_report.md").exists():
        level.append("缺 _proofread_report.md" + ("" if post_num >= DRAFT_REQUIRED_SINCE else "（歷史篇、不回補）"))

    # --- 站上圖 vs 本地歸檔（站上有、本地沒有 = 歸檔漏） ---
    site_dir = PUBLIC_IMG / post_id
    if site_dir.is_dir():
        local_names = {p.name for p in (draft_dir / "images").rglob("*") if p.is_file()}
        missing = sorted(p.name for p in site_dir.iterdir() if p.is_file() and p.name not in local_names)
        if missing:
            fails.append(f"站上圖未歸檔到本地：{missing}")

    # --- 殘檔 ---
    realistic = draft_dir / "images" / "content" / "realistic"
    if realistic.is_dir():
        leftovers = sorted(p.name for p in realistic.iterdir() if p.suffix == ".bak" or p.name.endswith(".png.bak"))
        twins = sorted(p.name for p in realistic.glob("*.png") if p.with_suffix(".webp").exists())
        if leftovers:
            warns.append(f"殘檔 .bak：{leftovers}")
        if twins:
            warns.append(f"png/webp 雙份並存（webp 已上站，png 可刪）：{twins}")

    # --- draft 半成品提醒 ---
    fm_head = astro_md.read_text(encoding="utf-8")[:800]
    if re.search(r"^draft:\s*true", fm_head, re.M):
        note = draft_dir / "規劃筆記.md"
        status = ""
        if note.exists():
            m = re.search(r"^狀態:\s*(.+)$", note.read_text(encoding="utf-8"), re.M)
            status = f"（規劃筆記狀態：{m.group(1).strip()}）" if m else ""
        warns.append(f"Astro 檔 draft:true 半成品掛在站上 repo {status}")

    return (fails, warns)


def main():
    ap = argparse.ArgumentParser(description="文章歸檔完整度健檢")
    ap.add_argument("post_id", nargs="?", help="只檢查單篇，例 D014；省略則全部")
    args = ap.parse_args()

    if args.post_id:
        if not re.fullmatch(r"D\d{3,}", args.post_id):
            sys.exit(f"[ERR] post_id 格式錯（應為 D### 例 D014）：{args.post_id}")
        targets = [POSTS_DIR / f"{args.post_id}.md"]
        if not targets[0].exists():
            sys.exit(f"[ERR] Astro 檔不存在：{targets[0]}")
    else:
        targets = sorted(POSTS_DIR.glob("D*.md"))

    print(f"[RUN] audit_posts.py  共 {len(targets)} 篇\n")
    n_fail = n_warn = 0
    for md in targets:
        fails, warns = audit_one(md)
        n_fail += len(fails)
        n_warn += len(warns)
        if not fails and not warns:
            print(f"  {md.stem}  ✅ 歸檔完整")
            continue
        print(f"  {md.stem}")
        for f in fails:
            print(f"    ❌ {f}")
        for w in warns:
            print(f"    ⚠️  {w}")

    print(f"\n--- 結果：FAIL {n_fail} / WARN {n_warn} ---")
    if n_fail:
        sys.exit(1)


if __name__ == "__main__":
    main()
