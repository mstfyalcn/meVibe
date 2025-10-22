-- Örnek ilgi alanları ekle
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

-- Örnek motivasyon sözleri ekle
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
