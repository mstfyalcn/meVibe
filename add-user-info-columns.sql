-- Kullanıcı bilgileri için yeni sütunlar ekle

-- 1. İsim/Hitap sütunu ekle
ALTER TABLE anonymous_users 
ADD COLUMN IF NOT EXISTS name TEXT;

-- 2. Bildirim sayısı sütunu ekle
ALTER TABLE anonymous_users 
ADD COLUMN IF NOT EXISTS notification_count INTEGER DEFAULT 3;

-- 3. Mevcut durumu kontrol et
SELECT 
    id,
    device_id,
    name,
    notification_count,
    notification_time_start,
    notification_time_end,
    created_at
FROM anonymous_users
LIMIT 5;

-- 4. Tablo yapısını kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'anonymous_users'
ORDER BY ordinal_position;

-- 5. Varsayılan değerleri güncelle (opsiyonel - mevcut kullanıcılar için)
UPDATE anonymous_users 
SET notification_count = 3 
WHERE notification_count IS NULL;
