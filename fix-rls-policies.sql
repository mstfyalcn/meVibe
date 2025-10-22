-- Row Level Security Politikalarını Düzelt
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- 1. Anonymous Users Tablosu İçin Politikalar

-- RLS'i aktif et (eğer değilse)
ALTER TABLE anonymous_users ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları sil (eğer varsa)
DROP POLICY IF EXISTS "Enable read access for all users" ON anonymous_users;
DROP POLICY IF EXISTS "Enable insert for all users" ON anonymous_users;
DROP POLICY IF EXISTS "Enable update for all users" ON anonymous_users;
DROP POLICY IF EXISTS "Enable delete for all users" ON anonymous_users;

-- Yeni politikalar oluştur
-- Herkes okuyabilir
CREATE POLICY "Enable read access for all users" 
ON anonymous_users FOR SELECT 
USING (true);

-- Herkes ekleyebilir
CREATE POLICY "Enable insert for all users" 
ON anonymous_users FOR INSERT 
WITH CHECK (true);

-- Herkes güncelleyebilir
CREATE POLICY "Enable update for all users" 
ON anonymous_users FOR UPDATE 
USING (true);

-- Herkes silebilir
CREATE POLICY "Enable delete for all users" 
ON anonymous_users FOR DELETE 
USING (true);

-- 2. Interest Areas Tablosu İçin Politikalar

ALTER TABLE interest_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON interest_areas;
DROP POLICY IF EXISTS "Enable insert for all users" ON interest_areas;

CREATE POLICY "Enable read access for all users" 
ON interest_areas FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON interest_areas FOR INSERT 
WITH CHECK (true);

-- 3. User Interests Tablosu İçin Politikalar

ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON user_interests;
DROP POLICY IF EXISTS "Enable insert for all users" ON user_interests;
DROP POLICY IF EXISTS "Enable update for all users" ON user_interests;
DROP POLICY IF EXISTS "Enable delete for all users" ON user_interests;

CREATE POLICY "Enable read access for all users" 
ON user_interests FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON user_interests FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON user_interests FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON user_interests FOR DELETE 
USING (true);

-- 4. Motivation Quotes Tablosu İçin Politikalar

ALTER TABLE motivation_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON motivation_quotes;

CREATE POLICY "Enable read access for all users" 
ON motivation_quotes FOR SELECT 
USING (true);

-- Sonuçları kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
