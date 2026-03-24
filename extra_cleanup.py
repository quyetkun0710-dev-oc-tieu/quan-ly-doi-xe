import re
import os

filepath = r'c:\Users\Admin\Desktop\Test\Quản lý đội xe form\Đã chạy lần 4\index.html'

with open(filepath, encoding='utf-8') as f:
    content = f.read()

# Remove ANY nav-item or app-card or dash-card that contains 'chiphi' OR 'tab_chiphi' OR 'Chi Phí'
# Sidebar button removal (more aggressive)
content = re.sub(r'<button class="nav-item[^>]*data-tab="chiphi"[^>]*>.*?</button>', '', content, flags=re.DOTALL)
content = re.sub(r'<div class="app-card[^>]*onclick="openTab\(\'chiphi\',\'tab_chiphi_supabase.html\'\)"[^>]*>.*?</div>', '', content, flags=re.DOTALL)
content = re.sub(r'<div class="dash-card[^>]*onclick="openTab\(\'chiphi\',\'tab_chiphi_supabase.html\'\)"[^>]*>.*?</div>', '', content, flags=re.DOTALL)

# Cleanup extra empty lines
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html fully cleaned.")
