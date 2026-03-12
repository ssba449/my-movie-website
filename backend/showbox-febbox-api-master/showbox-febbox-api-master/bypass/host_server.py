import time
import logging
import uvicorn
import socket
import sys
import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from DrissionPage import ChromiumPage, ChromiumOptions

# CloudflareBypasser Class embedded directly to avoid import issues
class CloudflareBypasser:
    def __init__(self, driver: ChromiumPage, max_retries=-1, log=True):
        self.driver = driver
        self.max_retries = max_retries
        self.log = log

    def search_recursively_shadow_root_with_iframe(self,ele):
        if ele.shadow_root:
            if ele.shadow_root.child().tag == "iframe":
                return ele.shadow_root.child()
        else:
            for child in ele.children():
                result = self.search_recursively_shadow_root_with_iframe(child)
                if result:
                    return result
        return None

    def search_recursively_shadow_root_with_cf_input(self,ele):
        if ele.shadow_root:
            if ele.shadow_root.ele("tag:input"):
                return ele.shadow_root.ele("tag:input")
        else:
            for child in ele.children():
                result = self.search_recursively_shadow_root_with_cf_input(child)
                if result:
                    return result
        return None
    
    def locate_cf_button(self):
        button = None
        eles = self.driver.eles("tag:input")
        for ele in eles:
            if "name" in ele.attrs.keys() and "type" in ele.attrs.keys():
                if "turnstile" in ele.attrs["name"] and ele.attrs["type"] == "hidden":
                    button = ele.parent().shadow_root.child()("tag:body").shadow_root("tag:input")
                    break
            
        if button:
            return button
        else:
            self.log_message("Basic search failed. Searching for button recursively.")
            ele = self.driver.ele("tag:body")
            iframe = self.search_recursively_shadow_root_with_iframe(ele)
            if iframe:
                button = self.search_recursively_shadow_root_with_cf_input(iframe("tag:body"))
            else:
                self.log_message("Iframe not found. Button search failed.")
            return button

    def log_message(self, message):
        if self.log:
            print(message)

    def click_verification_button(self):
        try:
            button = self.locate_cf_button()
            if button:
                self.log_message("Verification button found. Attempting to click.")
                button.click()
            else:
                self.log_message("Verification button not found.")
        except Exception as e:
            self.log_message(f"Error clicking verification button: {e}")

    def is_bypassed(self):
        try:
            title = self.driver.title.lower()
            return "just a moment" not in title
        except Exception as e:
            self.log_message(f"Error checking page title: {e}")
            return False

    def bypass(self):
        try_count = 0
        while not self.is_bypassed():
            if 0 < self.max_retries + 1 <= try_count:
                self.log_message("Exceeded maximum retries. Bypass failed.")
                break
            self.log_message(f"Attempt {try_count + 1}: Verification page detected. Trying to bypass...")
            self.click_verification_button()
            try_count += 1
            time.sleep(2)
        if self.is_bypassed():
            self.log_message("Bypass successful.")
        else:
            self.log_message("Bypass failed.")

# Server Logic
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Host Cloudflare Bypass")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChromiumPage with options
co = ChromiumOptions()
co.set_argument('--headless=new')
co.set_argument('--no-sandbox')
co.set_argument('--disable-gpu')
driver = ChromiumPage(co)

@app.get("/html")
async def get_html(url: str = Query(..., description="The URL to bypass")):
    logger.info(f"Bypassing Cloudflare for: {url}")
    try:
        driver.get(url)
        bypasser = CloudflareBypasser(driver)
        if not bypasser.is_bypassed():
            logger.info("Challenge detected, attempting bypass...")
            bypasser.bypass()
        time.sleep(1)
        html = driver.html
        return html
    except Exception as e:
        logger.error(f"Bypass failed: {str(e)}")
        return {"error": str(e)}

@app.on_event("shutdown")
def shutdown_event():
    driver.quit()

if __name__ == "__main__":
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("0.0.0.0", 8000))
        s.close()
    except socket.error as e:
        print("Port 8000 is already in use!")
        sys.exit(1)
    uvicorn.run(app, host="0.0.0.0", port=8000)
