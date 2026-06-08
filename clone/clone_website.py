"""
SQI Website Cloner — For authorized use only.
Creates an offline mirror of any website (HTML + CSS + JS + Images).
Author: ChatGPT (Accentuate Edition)
"""

import os, requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from pathlib import Path

# ========= CONFIGURATION =========
START_URL = "https://sqi.edu.ng"       # change if needed
DOWNLOAD_DIR = Path("sqi_full_clone")  # output folder
MAX_DEPTH = 2                          # 1=homepage only, 2=follow internal links

# ========= CORE FUNCTIONS =========
def download_file(url, folder):
    """Download any file and save locally"""
    try:
        local_name = folder / urlparse(url).path.split("/")[-1]
        if not local_name.suffix:
            local_name = local_name.with_suffix(".html")
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        folder.mkdir(parents=True, exist_ok=True)
        with open(local_name, "wb") as f:
            f.write(r.content)
        print("✅ Saved:", local_name)
        return local_name
    except Exception as e:
        print("⚠️  Error:", url, "→", e)
        return None


def scrape_page(url, depth, visited):
    """Recursively download pages and linked assets"""
    if depth > MAX_DEPTH or url in visited or not url.startswith(START_URL):
        return
    visited.add(url)
    print("\n🔗 Fetching:", url)

    try:
        res = requests.get(url, timeout=30)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")

        # Download linked assets (CSS, JS, images)
        for tag, attr in [("img", "src"), ("link", "href"), ("script", "src")]:
            for el in soup.find_all(tag):
                link = el.get(attr)
                if not link:
                    continue
                full = urljoin(url, link)
                if any(full.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".gif", ".webp", ".css", ".js"]):
                    local = download_file(full, DOWNLOAD_DIR / "assets")
                    if local:
                        el[attr] = os.path.relpath(local, DOWNLOAD_DIR)

        # Save updated HTML
        page_name = "index.html" if url == START_URL else urlparse(url).path.strip("/") + ".html"
        out_path = DOWNLOAD_DIR / page_name
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(str(soup), encoding="utf-8")
        print("📝 Page saved:", out_path)

        # Follow internal links (depth control)
        for a in soup.find_all("a", href=True):
            next_url = urljoin(url, a["href"])
            if START_URL in next_url:
                scrape_page(next_url.split("#")[0], depth + 1, visited)
    except Exception as e:
        print("⚠️  Failed to fetch", url, "→", e)


# ========= MAIN EXECUTION =========
if __name__ == "__main__":
    print("\n🌐 Starting SQI full-site clone …\n")
    visited = set()
    DOWNLOAD_DIR.mkdir(exist_ok=True)
    scrape_page(START_URL, 0, visited)
    print("\n🎉 Clone completed! Files saved in:", DOWNLOAD_DIR.resolve())