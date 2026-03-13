const axios = require('axios');

const SUPABASE_URL = "https://mpuqcmektepsqsazuvtb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdXFjbWVrdGVwc3FzYXp1dnRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NjU5OCwiZXhwIjoyMDg4NzIyNTk4fQ.eBWCfXV5v4SNSICYg_wVwaez9ycRk7-XmTry7UnHTU8";

async function testInsert() {
    console.log('--- Testing Insert into danhgia (via REST) ---');
    const payload = {
        ma_nv: 'TX000_TEST',
        ho_ten: 'Test Driver',
        ngay: new Date().toISOString().split('T')[0],
        muc_do: 'Nhẹ',
        loi: 'Thử nghiệm kết nối axios',
        so_lan: 1,
        ket_luan: 'Bỏ qua',
        ghi_chu: 'Axios test script',
        updated_at: new Date().toISOString()
    };

    try {
        const res = await axios.post(`${SUPABASE_URL}/rest/v1/danhgia`, payload, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        });
        console.log('✅ Insert SUCCESS:', res.data);
        
        console.log('Cleaning up test data...');
        await axios.delete(`${SUPABASE_URL}/rest/v1/danhgia?ma_nv=eq.TX000_TEST`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        console.log('✅ Done');
    } catch (error) {
        console.error('❌ Insert FAILED:', error.response ? error.response.data : error.message);
    }
}

testInsert();
