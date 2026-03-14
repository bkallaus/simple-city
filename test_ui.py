import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Load the page
        await page.goto("http://localhost:8000/index.html")
        await page.wait_for_timeout(2000)

        # Click on multiple points to try to hit a grid square
        for x in range(300, 500, 20):
            for y in range(300, 500, 20):
                await page.click("canvas", position={"x": x, "y": y})
                await page.wait_for_timeout(100)

                span = page.locator("#next-tier")
                text_content = await span.text_content()
                if "1" not in text_content:
                    print("Successfully advanced tier!", text_content)
                    break

        await browser.close()

asyncio.run(run())
