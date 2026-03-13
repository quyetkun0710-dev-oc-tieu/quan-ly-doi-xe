const axios = require('axios');

const SUPABASE_URL = "https://mpuqcmektepsqsazuvtb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdXFjbWVrdGVwc3FzYXp1dnRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NjU5OCwiZXhwIjoyMDg4NzIyNTk4fQ.eBWCfXV5v4SNSICYg_wVwaez9ycRk7-XmTry7UnHTU8";

async function checkConnection() {
  console.log('--- Đang kiểm tra kết nối tới Supabase ---');
  try {
    const res = await axios.get(`${SUPABASE_URL}/rest/v1/xe?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    console.log('✅ Kết nối thành công!');
    console.log('Số lượng xe hiện có trong DB:', res.data[0]?.count || 0);
  } catch (err) {
    console.error('❌ Lỗi kết nối:', err.response ? err.response.data : err.message);
  }
}

checkConnection();
