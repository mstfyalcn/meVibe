-- Anonim kullanıcıları auth kullanıcılarına bağlamak için sütun ekle

-- 1. auth_user_id sütununu ekle
ALTER TABLE anonymous_users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 2. Foreign key constraint ekle (opsiyonel, eğer auth.users tablosuna bağlamak isterseniz)
-- NOT: Supabase'de auth.users tablosu özel olduğu için bu adım opsiyoneldir
-- ALTER TABLE anonymous_users 
-- ADD CONSTRAINT fk_auth_user 
-- FOREIGN KEY (auth_user_id) 
-- REFERENCES auth.users(id) 
-- ON DELETE SET NULL;

-- 3. Index oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_anonymous_users_auth_user_id 
ON anonymous_users(auth_user_id);

-- 4. Mevcut durumu kontrol et
SELECT 
    COUNT(*) as total_users,
    COUNT(auth_user_id) as linked_users,
    COUNT(*) - COUNT(auth_user_id) as unlinked_users
FROM anonymous_users;

-- 5. Tablo yapısını kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'anonymous_users'
ORDER BY ordinal_position;
