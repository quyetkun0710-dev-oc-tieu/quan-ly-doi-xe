import urllib.request
import json
import random
import time
from datetime import datetime, timedelta

SUPABASE_URL = "https://mpuqcmektepsqsazuvtb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdXFjbWVrdGVwc3FzYXp1dnRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NjU5OCwiZXhwIjoyMDg4NzIyNTk4fQ.eBWCfXV5v4SNSICYg_wVwaez9ycRk7-XmTry7UnHTU8"

def supabase_get(table, params=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{params}"
    req = urllib.request.Request(url)
    req.add_header("apikey", SUPABASE_KEY)
    req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Error fetching {table}: {e}")
        return []

def supabase_post(table, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    req = urllib.request.Request(url, data=json.dumps(data).encode(), method='POST')
    req.add_header("apikey", SUPABASE_KEY)
    req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=minimal")
    with urllib.request.urlopen(req) as response:
        return response.read().decode()

def simulate():
    print("Re-fetching drivers and vehicles for enhanced simulation...")
    drivers = supabase_get("taixe", "select=ma_nv,ho_ten")
    vehicles = supabase_get("xe", "select=bien_so_xe")

    if not drivers: drivers = [{"ma_nv": "DEV01", "ho_ten": "Driver Alpha"}]
    if not vehicles: vehicles = [{"bien_so_xe": "99XX-12345"}]

    tables = ["nhatky", "chiphi", "fuel", "baoduong"]
    
    print(f"Starting simulate for 20 activities...")

    for i in range(20):
        driver = random.choice(drivers)
        vehicle = random.choice(vehicles)
        table = random.choice(tables)
        
        # Simulating activity FOR TODAY
        now = datetime.now()
        timestamp = now.isoformat()
        
        payload = {
            "bien_so_xe": vehicle["bien_so_xe"],
            "updated_at": timestamp
        }

        if table == "nhatky":
            # Simulation of a trip
            km_start = random.randint(30000, 80000)
            km_trip = random.randint(40, 150)
            payload.update({
                "ma_nv": driver["ma_nv"],
                "tai_xe": driver["ho_ten"],
                "ngay_van_hanh": now.strftime("%Y-%m-%d"),
                "chuyen_so": str(random.randint(1, 5)),
                "loai_chuyen": random.choice(["Tuyến chính", "Tăng cường", "Tuyến nhánh"]),
                "gio_xuat": f"{random.randint(4, 10):02d}:00",
                "gio_ve": f"{random.randint(14, 22):02d}:30",
                "km_xuat": km_start,
                "km_ve": km_start + km_trip,
                "tong_km": km_trip,
                "suco_toggle": "khong",
                "ghi_chu": f"Chuyến hàng sim #{i+1}"
            })
            payload["tong_gio"] = 10.5 # Simplified
        elif table == "chiphi":
            # Simulation of an expense
            payload.update({
                "ma_nv": driver["ma_nv"],
                "ho_ten_taixe": driver["ho_ten"],
                "ngay_thuc_hien": now.strftime("%Y-%m-%d"),
                "loai_chi_phi": random.choice(["Cầu đường", "Luật", "Sửa chữa nhanh", "Rửa xe"]),
                "so_tien": random.choice([35000, 75000, 150000, 250000]),
                "ghi_chu": f"Phí phát sinh #{i+1}"
            })
        elif table == "fuel":
            # Simulation of fueling
            liters = random.randint(40, 120)
            price = 20850
            payload.update({
                "ngay_thuc_hien": now.strftime("%Y-%m-%d"),
                "gio_thuc_hien": now.strftime("%H:%M"),
                "loai": "Dầu DO 0.001S",
                "so_lit": liters,
                "don_gia": price,
                "thanh_tien": liters * price,
                "km_sau": random.randint(50000, 51000),
                "km_truoc": random.randint(49000, 49500),
                "km_chenh_lech": 500, # Approximate
                "don_vi": random.choice(["Petrolimex CH01", "PVOil", "Comeco"]),
                "hoa_don": f"BILL-{random.randint(10000, 99999)}",
                "ghi_chu": "Simulated fuel log"
            })
        elif table == "baoduong":
            # Simulation of maintenance
            payload.update({
                "loai_hinh": random.choice(["Định kỳ", "Sửa chữa"]),
                "ngay_bat_dau": now.strftime("%Y-%m-%d"),
                "ngay_ket_thuc": now.strftime("%Y-%m-%d"),
                "tong_ngay": 1,
                "km_sau": 60000,
                "km_truoc": 55000,
                "km_chenh_lech": 5000,
                "moc_bao_duong": 60000,
                "don_vi": "Garage Fleet Core",
                "loai_don_vi": "External",
                "hang_muc": "Bảo dưỡng 10.000km",
                "ket_qua": "Đã hoàn thành",
                "loai_thanh_toan": "Chuyển khoản",
                "tong_tien": 2500000 + random.randint(0, 500000),
                "ghi_chu": f"Phiếu bảo dưỡng sim #{i+1}"
            })

        print(f"[{i+1}/20] Triggering '{table}' for vehicle {vehicle['bien_so_xe']}...")
        try:
            supabase_post(table, [payload])
        except Exception as e:
             # print(e)
             pass
             
        time.sleep(4.0)

    print("\nEnhanced simulation done. Manager dashboard should be updated.")

if __name__ == "__main__":
    simulate()
