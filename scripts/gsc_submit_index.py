"""dong-wu.com GSC 索引提交：Indexing API publish + URL Inspection 狀態查詢。

用法：python gsc_submit_index.py <url1> [<url2> ...]
例：  python gsc_submit_index.py https://dong-wu.com/customization-ethernet-cable-count/

GSC property 類型：Domain (sc-domain:dong-wu.com)
驗證身份：OAuth 2.0 user credentials（minxin20211231@gmail.com，dong-wu.com Domain owner）

為什麼用 OAuth 不用 service account：
  Indexing API 需 Owner 級權限；GSC Domain property 的 Owner 傳統需 DNS TXT 驗證，
  service account 無法取得，故改用本人 OAuth user identity 跑（已是 Domain owner）。
  詳見 memory/reference_dongwu_gcp_gsc_setup.md。

首次跑：會自動開瀏覽器要授權；按同意後 token 存到 oauth-token.json，之後自動 refresh。
"""
import os
import sys
from pathlib import Path

# Windows console 預設 Big5/cp950，中文輸出會亂碼；強制 utf-8（免每次靠 PYTHONIOENCODING）
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow

SCRIPT_DIR = Path(__file__).resolve().parent
CLIENT_FILE = SCRIPT_DIR / "oauth-client.json"
TOKEN_FILE = SCRIPT_DIR / "oauth-token.json"

SITE_URL = "sc-domain:dong-wu.com"
SCOPES = [
    "https://www.googleapis.com/auth/indexing",
    "https://www.googleapis.com/auth/webmasters.readonly",
]


def get_credentials():
    """取得 OAuth credentials，首次會跑互動授權、之後自動 refresh。"""
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if creds and creds.valid:
        return creds

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
        return creds

    if not CLIENT_FILE.exists():
        sys.exit(
            f"[ERR] OAuth client JSON 不存在：{CLIENT_FILE}\n"
            "請先到 GCP Console 建立 Desktop OAuth 用戶端，下載 JSON 重新命名為 oauth-client.json 放進 scripts/。"
        )

    print("[OAuth] 啟動本地授權伺服器，瀏覽器會自動跳出 Google 同意畫面...", flush=True)
    print("[OAuth] 如果瀏覽器沒自動開，下面這行 URL 複製到瀏覽器即可", flush=True)
    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_FILE), SCOPES)
    creds = flow.run_local_server(port=0, open_browser=True)
    TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
    try:
        os.chmod(TOKEN_FILE, 0o600)
    except OSError:
        pass
    print(f"[OK] OAuth 授權完成，token 已存到 {TOKEN_FILE.name}")
    return creds


def submit_indexing(creds, url: str):
    svc = build("indexing", "v3", credentials=creds, cache_discovery=False)
    body = {"url": url, "type": "URL_UPDATED"}
    try:
        res = svc.urlNotifications().publish(body=body).execute()
        ts = res.get("urlNotificationMetadata", {}).get("latestUpdate", {}).get("notifyTime", "?")
        return ("OK", f"notified {ts}")
    except HttpError as e:
        return ("ERR", f"{e.status_code} {e.reason}: {getattr(e, 'error_details', e)}")


def inspect_url(creds, url: str):
    svc = build("searchconsole", "v1", credentials=creds, cache_discovery=False)
    try:
        res = svc.urlInspection().index().inspect(body={
            "inspectionUrl": url,
            "siteUrl": SITE_URL,
        }).execute()
        idx = res.get("inspectionResult", {}).get("indexStatusResult", {})
        return ("OK", f"verdict={idx.get('verdict')} coverageState={idx.get('coverageState')} lastCrawlTime={idx.get('lastCrawlTime', 'never')}")
    except HttpError as e:
        return ("ERR", f"{e.status_code} {e.reason}")


def main():
    urls = sys.argv[1:]
    if not urls:
        print("usage: python gsc_submit_index.py <url1> [<url2> ...]")
        sys.exit(1)

    creds = get_credentials()

    for u in urls:
        print(f"\n=== {u} ===")
        st, msg = submit_indexing(creds, u)
        print(f"[Indexing API] {st}: {msg}")
        st2, msg2 = inspect_url(creds, u)
        print(f"[URL Inspection] {st2}: {msg2}")


if __name__ == "__main__":
    main()
