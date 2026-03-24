import re

filepath = r'c:\Users\Admin\Desktop\Test\Quản lý đội xe form\Đã chạy lần 4\index.html'

with open(filepath, encoding='utf-8') as f:
    content = f.read()

# 1. Sidebar tab hide (already done, but let's confirm/refine)
# 2. Tabs metadata removal
content = re.sub(r"chiphi: { icon: '<i class=\"fas fa-wallet\"></i>', title: 'Chi Phí' },?\n", "", content)
content = re.sub(r",\s+chiphi: { icon: '<i class=\"fas fa-wallet\"></i>', title: 'Chi Phí' }", "", content)

# 3. Role permissions removal
content = re.sub(r"\s+'chiphi': \['manager', 'admin'\],?\n", "\n", content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done index.html cleanup!")
