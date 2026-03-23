-- Bảng lưu trữ Web Push Subscriptions của từng người dùng
-- Chạy trong Supabase SQL Editor

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ma_nv      text NOT NULL REFERENCES taixe(ma_nv) ON DELETE CASCADE,
    endpoint   text NOT NULL UNIQUE,
    p256dh     text NOT NULL,
    auth       text NOT NULL,
    user_agent text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index để query theo ma_nv nhanh
CREATE INDEX IF NOT EXISTS idx_push_subs_ma_nv ON push_subscriptions(ma_nv);

-- Tự cập nhật updated_at
CREATE OR REPLACE FUNCTION update_push_sub_timestamp()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER push_subs_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_push_sub_timestamp();

-- Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Tài xế chỉ thấy và quản lý subscription của chính mình
CREATE POLICY "Users manage own subscriptions"
    ON push_subscriptions
    FOR ALL
    USING (ma_nv = current_setting('app.current_user', true));

-- Cho phép service_role full access (Edge Function dùng)
CREATE POLICY "Service role full access"
    ON push_subscriptions
    TO service_role
    USING (true)
    WITH CHECK (true);
