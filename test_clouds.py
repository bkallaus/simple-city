import re

with open("main.js", "r") as f:
    content = f.read()

# lower clouds
content = re.sub(r'const y = 8 \+ Math\.random\(\) \* 5;     // High up', 'const y = 0.5 + Math.random() * 1.5;     // Ground fog', content)
content = re.sub(r'cloud\.position\.y = 8 \+ Math\.random\(\) \* 5;', 'cloud.position.y = 0.5 + Math.random() * 1.5;', content)

# stop tick so we can set up the board exactly like GOAL.png
content = re.sub(r'setInterval\(gameTick, CONFIG\.tickRate\);', '// setInterval(gameTick, CONFIG.tickRate);', content)

with open("main_test.js", "w") as f:
    f.write(content)

with open("index.html", "r") as f:
    html = f.read()
    html = html.replace('src="main.js"', 'src="main_test.js"')

with open("index_test.html", "w") as f:
    f.write(html)
