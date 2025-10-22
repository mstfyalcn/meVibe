-- Row Level Security'yi Devre Dışı Bırak (Geliştirme için)
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- UYARI: Bu, tüm tabloları herkese açık hale getirir
-- Sadece geliştirme/test aşamasında kullanın

-- RLS'i tüm tablolardan kaldır
ALTER TABLE anonymous_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE interest_areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests DISABLE ROW LEVEL SECURITY;
ALTER TABLE motivation_quotes DISABLE ROW LEVEL SECURITY;

-- Mevcut politikaları sil
DROP POLICY IF EXISTS "Enable read access for all users" ON anonymous_users;
DROP POLICY IF EXISTS "Enable insert for all users" ON anonymous_users;
DROP POLICY IF EXISTS "Enable update for all users" ON anonymous_users;
DROP POLICY IF EXISTS "Enable delete for all users" ON anonymous_users;

DROP POLICY IF EXISTS "Enable read access for all users" ON interest_areas;
DROP POLICY IF EXISTS "Enable insert for all users" ON interest_areas;

DROP POLICY IF EXISTS "Enable read access for all users" ON user_interests;
DROP POLICY IF EXISTS "Enable insert for all users" ON user_interests;
DROP POLICY IF EXISTS "Enable update for all users" ON user_interests;
DROP POLICY IF EXISTS "Enable delete for all users" ON user_interests;

DROP POLICY IF EXISTS "Enable read access for all users" ON motivation_quotes;

-- Kontrol et
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

SELECT 'RLS devre dışı bırakıldı!' as status;
