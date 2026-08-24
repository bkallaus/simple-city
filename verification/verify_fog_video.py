from playwright.sync_api import sync_playwright
import os
import time

def run_cuj(page):
    # Navigate to the local server which is running main.js and index.html
    page.goto("http://localhost:8000/index.html")
    page.wait_for_timeout(1000)

    # We want to see the new ground fog in action
    # Stop the game logic so things don't go crazy, but clouds still drift
    page.evaluate('''() => {
        if (window.gameInterval) clearInterval(window.gameInterval);

        // Let's place a couple of buildings to give scale to the fog
        city.place(5, 5, 2);
        spawnVisual(5, 5, 2);

        city.place(5, 6, 2);
        spawnVisual(5, 6, 2);
    }''')
    page.wait_for_timeout(1000)

    # Let the clouds animate for a couple of seconds so it records in the video
    page.wait_for_timeout(3000)

    # Take screenshot at the key moment
    page.screenshot(path="verification/screenshots/fog_verification.png")
    page.wait_for_timeout(1000)  # Hold final state for the video

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()  # MUST close context to save the video
            browser.close()
