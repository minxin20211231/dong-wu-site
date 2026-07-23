"""把 Astro 站文章鏡像成 Obsidian 端「終稿草稿.md」備份（含 frontmatter）。

source of truth = dong-wu-site/src/content/posts/D###.md（上線用的那份）
鏡像目標     = 365QA/posts/D###-中文短摘/終稿草稿.md（Obsidian 可讀屬性表）

用法：
  python scripts/sync_drafts.py            # 同步全部 D###
  python scripts/sync_drafts.py D008       # 只同步單篇
  python scripts/sync_drafts.py --check    # 只檢查不寫（列出不同步 / 缺資料夾的篇）

為什麼需要這支：終稿草稿是 Astro 檔的鏡像備份，過去用手動「抽 body」會切掉
frontmatter（Obsidian 看不到屬性表），且容易漏建/分叉。一律以本腳本生成，
保證兩份逐字一致、單一 source of truth 在 Astro 端。
"""
import argparse
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

REPO_ROOT = Path(__file__).resolve().parent.parent          # dong-wu-site/
POSTS_DIR = REPO_ROOT / "src" / "content" / "posts"          # Astro source of truth
DRAFT_ROOT = REPO_ROOT.parent / "365QA" / "posts"            # 懂屋KYH/365QA/posts


def find_draft_dir(post_id: str) -> Path | None:
    """找 365QA/posts/D###-中文短摘/ 資料夾（用 glob 容忍中文短摘）。"""
    hits = sorted(DRAFT_ROOT.glob(f"{post_id}-*"))
    hits = [h for h in hits if h.is_dir()]
    return hits[0] if hits else None


def sync_one(astro_md: Path, check: bool) -> str:
    """回傳狀態字串：synced / unchanged / nodir / would-sync。"""
    post_id = astro_md.stem                                   # D008
    draft_dir = find_draft_dir(post_id)
    if draft_dir is None:
        return "nodir"

    target = draft_dir / "終稿草稿.md"
    new_text = astro_md.read_text(encoding="utf-8")
    old_text = target.read_text(encoding="utf-8") if target.exists() else None

    if old_text == new_text:
        return "unchanged"
    if check:
        return "would-sync"

    target.write_text(new_text, encoding="utf-8", newline="\n")
    return "synced"


def main():
    ap = argparse.ArgumentParser(description="鏡像 Astro 文章 → Obsidian 終稿草稿備份")
    ap.add_argument("post_id", nargs="?", help="只同步單篇，例 D008；省略則全部")
    ap.add_argument("--check", action="store_true", help="只檢查不寫，列出不同步的篇")
    args = ap.parse_args()

    if args.post_id:
        if not re.fullmatch(r"D\d{3,}", args.post_id):
            sys.exit(f"[ERR] post_id 格式錯（應為 D### 例 D008）：{args.post_id}")
        targets = [POSTS_DIR / f"{args.post_id}.md"]
        if not targets[0].exists():
            sys.exit(f"[ERR] Astro 檔不存在：{targets[0]}")
    else:
        targets = sorted(POSTS_DIR.glob("D*.md"))

    mode = "CHECK（不寫入）" if args.check else "SYNC"
    print(f"[RUN] sync_drafts.py [{mode}]  共 {len(targets)} 篇\n")

    tally = {"synced": 0, "unchanged": 0, "nodir": 0, "would-sync": 0}
    issues = []
    for md in targets:
        status = sync_one(md, args.check)
        tally[status] += 1
        icon = {
            "synced": "✅ 已鏡像",
            "unchanged": "・ 已同步（無變化）",
            "nodir": "❌ 找不到 365QA 資料夾",
            "would-sync": "⚠️  不同步（--check）",
        }[status]
        print(f"  {md.stem}  {icon}")
        if status in ("nodir", "would-sync"):
            issues.append((md.stem, status))

    print(f"\n--- 結果：鏡像 {tally['synced']} / 無變化 {tally['unchanged']} / "
          f"待同步 {tally['would-sync']} / 缺資料夾 {tally['nodir']} ---")

    if issues:
        if any(s == "nodir" for _, s in issues):
            print("\n[注意] 缺資料夾的篇，需先在 365QA/posts/ 建 D###-中文短摘/ 再重跑。")
        if args.check and any(s == "would-sync" for _, s in issues):
            print("[提示] 去掉 --check 直接跑即可把上列篇對齊 Astro。")
            sys.exit(1)


if __name__ == "__main__":
    main()
