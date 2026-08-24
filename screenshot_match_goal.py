from playwright.sync_api import sync_playwright
import os
import time

def take_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        filepath = "file://" + os.path.abspath("index_test.html")
        page.goto(filepath)

        # We want to reproduce the GOAL.png state exactly to see if any logic/visuals are missing.
        # Clear the board
        page.evaluate('''() => {
            for(let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    city.grid[i][j] = null;
                    if (city.meshGrid[i][j]) {
                        scene.remove(city.meshGrid[i][j]);
                        city.meshGrid[i][j] = null;
                    }
                }
            }

            // Replicate GOAL.png setup
            city.place(4, 4, 2); // Teal
            spawnVisual(4, 4, 2);

            city.place(4, 3, 1); // Red
            spawnVisual(4, 3, 1);

            city.place(3, 4, 1); // Red
            spawnVisual(3, 4, 1);

            city.place(5, 5, 1); // Red
            spawnVisual(5, 5, 1);

            city.place(5, 6, 1); // Red
            spawnVisual(5, 6, 1);

            city.place(6, 6, 1); // Red
            spawnVisual(6, 6, 1);

            city.place(7, 5, 1); // Red
            spawnVisual(7, 5, 1);

            city.place(8, 5, 1); // Red
            spawnVisual(8, 5, 1);

            city.place(8, 4, 1); // Red
            spawnVisual(8, 4, 1);

            city.place(9, 6, 1); // Red
            spawnVisual(9, 6, 1);

            // Adjust clouds to ground level like goal
            cloudSystem.clouds.forEach(c => c.position.y = 0.5);

            // Stop animations for screenshot
            gsap.globalTimeline.pause();
        }''')

        time.sleep(3)
        page.screenshot(path="current_goal_test.png")
        browser.close()

take_screenshot()
