async function run() {
    const tables = ['xe', 'taixe', 'nhiemvu', 'thongbao', 'fuel', 'nhatky', 'baoduong', 'lopxe', 'diemgiaohang', 'dangkylich', 'kehoachbaoduong', 'danhgia'];
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbya7Dglug6AIquYYUqt8Qqo3FhX3czlAUWa18VeSk29Oags8M86AiEwtrIdHqrMNL68/exec";
    const fs = require('fs');

    let sql = "";
    for (let t of tables) {
        console.log(`Fetching ${t}...`);
        try {
            const res = await fetch(`${SCRIPT_URL}?tag=${t}`);
            const data = await res.json();
            if (data && data.length > 0 && !data[0].error) {
                const keys = Object.keys(data[0]);
                sql += `-- Table: ${t}\n`;

                // Alter statements to add columns if table exists
                sql += `-- Thêm các cột còn thiếu cho bảng ${t}\n`;
                for (let k of keys) {
                    if (k === 'id' || k === 'created_at' || k === 'updated_at') continue;
                    let type = "TEXT";
                    if (k === 'tai_trong' || k.startsWith('km_') || k.includes('chi_phi') || k.includes('thanh_tien') || k.includes('so_lit') || k.includes('tong_km') || k.includes('tong_gio')) {
                        type = "NUMERIC";
                    } else if (k.startsWith('ngay_') || k === 'nam_sx' || k === 'han_gplx' || k === 'ngay_dang_ky' || k === 'ngay_nhan_viec' || k === 'ngay_nghi_viec') {
                        type = "DATE";
                    } else if (k.startsWith('is_') || k === 'trang_thai_duyet') {
                        type = "TEXT";
                    }
                    sql += `ALTER TABLE public.${t} ADD COLUMN IF NOT EXISTS "${k}" ${type};\n`;
                }
                sql += "\n";
            }
        } catch (e) {
            console.error(`Lỗi lấy dữ liệu bảng ${t}:`, e);
        }
    }
    fs.writeFileSync('supabase_schema.sql', sql);
    console.log("Done! Check supabase_schema.sql");
}
run();
