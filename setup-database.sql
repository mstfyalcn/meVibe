-- MeVibe Veritabanı Kurulum Scripti
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- 1. Mevcut tabloları kontrol et
SELECT 'Mevcut tablolar:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Anonymous Users tablosu oluştur
CREATE TABLE IF NOT EXISTS anonymous_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT UNIQUE NOT NULL,
    notification_time_start TIME DEFAULT '09:00:00',
    notification_time_end TIME DEFAULT '10:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Interest Areas tablosu oluştur
CREATE TABLE IF NOT EXISTS interest_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Interests tablosu oluştur
CREATE TABLE IF NOT EXISTS user_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES anonymous_users(id) ON DELETE CASCADE,
    interest_id UUID REFERENCES interest_areas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, interest_id)
);

-- 5. Motivation Quotes tablosu oluştur
CREATE TABLE IF NOT EXISTS motivation_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    author TEXT,
    interest_area_id UUID REFERENCES interest_areas(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Index'ler oluştur
CREATE INDEX IF NOT EXISTS idx_anonymous_users_device_id ON anonymous_users(device_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest_id ON user_interests(interest_id);
CREATE INDEX IF NOT EXISTS idx_motivation_quotes_interest_area_id ON motivation_quotes(interest_area_id);

-- 7. Örnek ilgi alanları ekle
INSERT INTO interest_areas (name, description, icon) VALUES
('Spor', 'Fitness, egzersiz ve sağlıklı yaşam', '💪'),
('İş', 'Kariyer, profesyonel gelişim ve iş hayatı', '💼'),
('Eğitim', 'Öğrenme, kişisel gelişim ve eğitim', '📚'),
('Sanat', 'Müzik, resim, edebiyat ve yaratıcılık', '🎨'),
('Teknoloji', 'Yazılım, programlama ve teknoloji', '💻'),
('Seyahat', 'Gezi, keşif ve macera', '✈️'),
('Aile', 'Aile ilişkileri ve çocuk bakımı', '👨‍👩‍👧‍👦'),
('Sağlık', 'Fiziksel ve mental sağlık', '🏥')
ON CONFLICT DO NOTHING;

-- 8. Örnek motivasyon sözleri ekle
INSERT INTO motivation_quotes (content, author, interest_area_id) VALUES
('Başarı, hazırlık ile fırsatın buluştuğu yerdir.', 'Seneca', (SELECT id FROM interest_areas WHERE name = 'İş' LIMIT 1)),
('Vücudunuz bir tapınaktır. Ona saygı gösterin.', 'Buddha', (SELECT id FROM interest_areas WHERE name = 'Spor' LIMIT 1)),
('Öğrenmek asla bitmez.', 'Leonardo da Vinci', (SELECT id FROM interest_areas WHERE name = 'Eğitim' LIMIT 1)),
('Sanat, ruhun gıdasıdır.', 'Aristotle', (SELECT id FROM interest_areas WHERE name = 'Sanat' LIMIT 1)),
('Teknoloji, insanlığın en büyük hizmetkarıdır.', 'Bill Gates', (SELECT id FROM interest_areas WHERE name = 'Teknoloji' LIMIT 1)),
('Dünya bir kitaptır ve seyahat etmeyenler sadece bir sayfasını okur.', 'Saint Augustine', (SELECT id FROM interest_areas WHERE name = 'Seyahat' LIMIT 1)),
('Aile, hayatın en değerli hazinesidir.', 'Maya Angelou', (SELECT id FROM interest_areas WHERE name = 'Aile' LIMIT 1)),
('Sağlık, en büyük zenginliktir.', 'Virgil', (SELECT id FROM interest_areas WHERE name = 'Sağlık' LIMIT 1))
ON CONFLICT DO NOTHING;

-- 9. Sonuçları kontrol et
SELECT 'Kurulum tamamlandı!' as info;
SELECT 'Anonymous Users:' as table_name, COUNT(*) as count FROM anonymous_users
UNION ALL
SELECT 'Interest Areas:' as table_name, COUNT(*) as count FROM interest_areas
UNION ALL
SELECT 'User Interests:' as table_name, COUNT(*) as count FROM user_interests
UNION ALL
SELECT 'Motivation Quotes:' as table_name, COUNT(*) as count FROM motivation_quotes;
