import requests
import json

SUPABASE_URL = "https://mpuqcmektepsqsazuvtb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdXFjbWVrdGVwc3FzYXp1dnRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NjU5OCwiZXhwIjoyMDg4NzIyNTk4fQ.eBWCfXV5v4SNSICYg_wVwaez9ycRk7-XmTry7UnHTU8"

def check_pending_maintenance():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    # Fetch records from 'baoduong' where 'trang_thai' is NOT 'Hoàn thành'
    # Use !eq.Hoàn thành for filtering
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/baoduong?trang_thai=neq.Hoàn thành&select=*",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        if not data:
            print("Toàn bộ xe đã hoàn thành bảo dưỡng/sửa chữa. Không có xe nào đang xử lý.")
            return
            
        print(f"--- DANH SÁCH XE ĐANG BẢO DƯỠNG/SỬA CHỮA ({len(data)} xe) ---")
        for item in data:
            plate = item.get('bien_so_xe', 'Unknown')
            category = item.get('loai_hinh', '-')
            detail = item.get('hang_muc', '-')
            start_date = item.get('ngay_bat_dau', '-')
            status = item.get('trang_thai', 'Đang xử lý')
            print(f"- Xe: {plate} | Loại: {category} | Hạng mục: {detail} | Bắt đầu: {start_date} | Trạng thái: {status}")
    else:
        print(f"Lỗi khi truy cập Supabase: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    check_pending_maintenance()
