from playwright.sync_api import sync_playwright
import os
import time

def take_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Use main index.html which loads main.js
        filepath = "file://" + os.path.abspath("index.html")
        page.goto(filepath)

        # We need a custom function to place things because top-level
        # variables like `city` aren't on the window object.
        # But actually in main.js, we attached some stuff to window for testing, or we can just capture as is.
        # Let's just capture the empty grid with clouds! Since clouds spawn immediately.

        # Stop game tick if needed, let clouds initialize
        page.evaluate('''() => {
            if (window.gameInterval) clearInterval(window.gameInterval);
        }''')

        # Give it a second for cloud animations to step
        time.sleep(2)
        page.screenshot(path="verification_main_fog.png")
        browser.close()

if __name__ == "__main__":
    take_screenshot()
