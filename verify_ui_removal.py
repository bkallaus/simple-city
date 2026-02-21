from playwright.sync_api import sync_playwright
import os

def test_ui_removal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get absolute path to index.html
        cwd = os.getcwd()
        file_path = f"file://{cwd}/index.html"

        print(f"Navigating to {file_path}")
        page.goto(file_path)

        # Wait for a bit to let things load (Three.js canvas etc)
        page.wait_for_timeout(2000)

        # Take a screenshot
        screenshot_path = "verification_screenshot.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        # Check if the elements are gone from the DOM
        # "POP CITY" was in h1
        # "POPULATION" was in #stats
        # "BUILDINGS" was in #next-building

        content = page.content()

        if "POP CITY" not in content:
            print("Verified: 'POP CITY' is not in page content.")
        else:
            print("FAILED: 'POP CITY' found in page content.")

        if "POPULATION" not in content:
             print("Verified: 'POPULATION' is not in page content.")
        else:
             print("FAILED: 'POPULATION' found in page content.")

        if "BUILDINGS" not in content:
             print("Verified: 'BUILDINGS' is not in page content.")
        else:
             print("FAILED: 'BUILDINGS' found in page content.")

        browser.close()

if __name__ == "__main__":
    test_ui_removal()
