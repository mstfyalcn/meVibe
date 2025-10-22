# Supabase Auth Ayarları Kontrol Listesi

## Aynı E-posta ile Kayıt Sorununu Çözmek İçin

### Supabase Dashboard'da Yapılması Gerekenler:

1. **Authentication > Settings** bölümüne gidin

2. **Email Auth** ayarlarını kontrol edin:
   - ✅ "Enable email confirmations" **AÇIK** olmalı
   - ✅ "Enable email signups" **AÇIK** olmalı

3. **Advanced Settings**:
   - ✅ "Disable email signups" **KAPALI** olmalı

4. **Security and Protection**:
   - ✅ "Disable duplicate emails" **AÇIK** olabilir (önerilir)

### Beklenen Davranış:

#### Doğru Yapılandırma ile:
```
Aynı e-posta ile kayıt → "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin." ✅
```

#### Yanlış Yapılandırma ile:
```
Aynı e-posta ile kayıt → Sessizce başarılı gibi görünür ❌
```

### Test Senaryoları:

1. **Yeni e-posta ile kayıt**: 
   - E-posta doğrulama linki gönderilmeli
   
2. **Aynı e-posta ile tekrar kayıt**:
   - Hata mesajı gösterilmeli
   - "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin."

3. **Doğrulanmamış e-posta ile giriş**:
   - "E-posta adresiniz henüz onaylanmamış. Lütfen e-postanızı kontrol edin."

### Debug İçin:

Hata mesajlarını görmek için:
1. Uygulamayı geliştirici modunda çalıştırın
2. Console loglarını kontrol edin
3. Hata mesajı şu formatta görünecek: `Auth Error: [Orijinal mesaj]`

Bu sayede hangi hata tipinin geldiğini görebilir ve gerekirse kod güncellemesi yapabilirsiniz.
