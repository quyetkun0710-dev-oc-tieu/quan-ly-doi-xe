const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://mpuqcmektepsqsazuvtb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdXFjbWVrdGVwc3FzYXp1dnRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NjU5OCwiZXhwIjoyMDg4NzIyNTk4fQ.eBWCfXV5v4SNSICYg_wVwaez9ycRk7-XmTry7UnHTU8";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkColumns() {
    const { data, error } = await supabase.from('xe').select('*').limit(1);
    if (error) {
        console.error(error);
    } else {
        console.log('Columns in table xe:', Object.keys(data[0] || {}));
    }
}
checkColumns();
