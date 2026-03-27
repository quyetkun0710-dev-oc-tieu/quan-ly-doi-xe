/**
 * QUẢN LÝ ĐỘI XE - CẤU HÌNH TẬP TRUNG (v1.0)
 * Lưu trữ các hằng số và cấu hình dùng chung cho toàn bộ ứng dụng.
 */

window.APP_CONFIG = {
    // Thông tin kết nối Supabase
    SUPABASE_URL: "https://mpuqcmektepsqsazuvtb.supabase.co",
    
    // LƯU Ý BẢO MẬT: 
    // Hiện tại bạn đang dùng service_role key ở frontend. 
    // Để an toàn, hãy chuyển sang dùng 'anon' key và bật RLS trên Supabase.
    SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdXFjbWVrdGVwc3FzYXp1dnRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NjU5OCwiZXhwIjoyMDg4NzIyNTk4fQ.eBWCfXV5v4SNSICYg_wVwaez9ycRk7-XmTry7UnHTU8",
    
    // Các tùy chỉnh khác (nếu cần)
    APP_NAME: "Quản Lý Đội Xe",
    VERSION: "4.0.0",
    IS_PROD: false
};

// Hàm khởi tạo Supabase Client dùng chung (nếu script supabase-js đã được load)
window.initSupabase = function() {
    if (typeof supabase !== 'undefined') {
        return supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_KEY);
    } else {
        console.error("Supabase library not loaded yet!");
        return null;
    }
};
