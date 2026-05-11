"""dong-wu.com GSC 索引提交：Indexing API publish + URL Inspection 狀態查詢。

用法：python gsc_submit_index.py <url1> [<url2> ...]
例：  python gsc_submit_index.py https://dong-wu.com/customization-ethernet-cable-count/

GSC property 類型：Domain (sc-domain:dong-wu.com)
credentials：沿用旻欣 service account（已邀請進 dong-wu.com GSC property）
"""
import sys
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2 import service_account

CRED = r"C:\Users\winte\Documents\AI workflow\旻欣SEO\gsc-credentials.json"
SITE_URL = "sc-domain:dong-wu.com"


def submit_indexing(url: str):
    creds = service_account.Credentials.from_service_account_file(
        CRED, scopes=["https://www.googleapis.com/auth/indexing"]
    )
    svc = build("indexing", "v3", credentials=creds, cache_discovery=False)
    body = {"url": url, "type": "URL_UPDATED"}
    try:
        res = svc.urlNotifications().publish(body=body).execute()
        ts = res.get("urlNotificationMetadata", {}).get("latestUpdate", {}).get("notifyTime", "?")
        return ("OK", f"notified {ts}")
    except HttpError as e:
        return ("ERR", f"{e.status_code} {e.reason}: {getattr(e, 'error_details', e)}")


def inspect_url(url: str):
    creds = service_account.Credentials.from_service_account_file(
        CRED, scopes=["https://www.googleapis.com/auth/webmasters.readonly"]
    )
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
    for u in urls:
        print(f"\n=== {u} ===")
        st, msg = submit_indexing(u)
        print(f"[Indexing API] {st}: {msg}")
        st2, msg2 = inspect_url(u)
        print(f"[URL Inspection] {st2}: {msg2}")


if __name__ == "__main__":
    main()
