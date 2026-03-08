import re

with open('index.html', 'r') as f:
    content = f.read()

new_content = content.replace(
    '<div id="ui">\n    </div>',
    '<div id="ui">\n        <div>Next Tier: <span id="next-tier" aria-live="polite" aria-atomic="true"></span></div>\n    </div>'
)

with open('index.html', 'w') as f:
    f.write(new_content)
