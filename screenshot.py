from playwright.sync_api import sync_playwright
import os
import time

def take_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # open local file
        filepath = "file://" + os.path.abspath("index.html")
        page.goto(filepath)
        # wait a bit for 3d to render
        time.sleep(3)
        page.screenshot(path="current_state.png")
        browser.close()

take_screenshot()
