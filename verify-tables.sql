-- Tabloları ve verilerini kontrol et

-- 1. Tabloları listele
SELECT 'TABLES' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Anonymous users tablosunu kontrol et
SELECT 'ANONYMOUS_USERS' as info, COUNT(*) as count FROM anonymous_users;

-- 3. Interest areas tablosunu kontrol et
SELECT 'INTEREST_AREAS' as info, COUNT(*) as count FROM interest_areas;
SELECT name, description, icon FROM interest_areas ORDER BY name;

-- 4. User interests tablosunu kontrol et
SELECT 'USER_INTERESTS' as info, COUNT(*) as count FROM user_interests;

-- 5. Motivation quotes tablosunu kontrol et
SELECT 'MOTIVATION_QUOTES' as info, COUNT(*) as count FROM motivation_quotes;
SELECT content, author FROM motivation_quotes LIMIT 5;
