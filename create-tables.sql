-- 1. Anonymous Users tablosu
CREATE TABLE IF NOT EXISTS anonymous_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT UNIQUE NOT NULL,
    notification_time_start TIME DEFAULT '09:00:00',
    notification_time_end TIME DEFAULT '10:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Interest Areas tablosu
CREATE TABLE IF NOT EXISTS interest_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Interests tablosu (many-to-many ilişki)
CREATE TABLE IF NOT EXISTS user_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES anonymous_users(id) ON DELETE CASCADE,
    interest_id UUID REFERENCES interest_areas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, interest_id)
);

-- 4. Motivation Quotes tablosu
CREATE TABLE IF NOT EXISTS motivation_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    author TEXT,
    interest_area_id UUID REFERENCES interest_areas(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler oluştur
CREATE INDEX IF NOT EXISTS idx_anonymous_users_device_id ON anonymous_users(device_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest_id ON user_interests(interest_id);
CREATE INDEX IF NOT EXISTS idx_motivation_quotes_interest_area_id ON motivation_quotes(interest_area_id);
