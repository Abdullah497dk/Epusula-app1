# Epusula — Supabase Kurulumu

Bu klasördeki SQL dosyaları, uygulamanın gerçek backend'ini (Postgres + Auth) kurar.
Proje **şirketin kendi "epusula" Supabase hesabında** açılır ve SQL'ler oradaki
**SQL Editor**'e yapıştırılıp çalıştırılır.

## 1) Proje ve Auth ayarı
1. Supabase'de yeni bir proje oluştur (epusula hesabı).
2. **Authentication → Providers → Email → "Confirm email" seçeneğini KAPAT.**
   (Kayıt anında oturum açılsın; şimdilik e-posta doğrulaması yok.)

## 2) Migration'ları sırayla çalıştır (SQL Editor)
> Sıra önemlidir.

| Sıra | Dosya | Ne yapar |
|------|-------|----------|
| 1 | `migrations/1` | Tablolar (profiles, questions, custom_classes, class_members, join_requests, activities, answers), trigger, RLS |
| 2 | `migrations/2_admin_approval.sql` | İki adımlı admin onayı: `admin_status`, `is_super_admin`, süper-admin bootstrap, onay politikası |
| 3 | `migrations/3_questions_seed.sql` | 420 sorunun eklenmesi (`ON CONFLICT` ile tekrar çalıştırılabilir) |

`1` dosyası başında `DROP ... CASCADE` içerdiği için her seferinde **sıfırdan** kurar;
tekrar kuracaksan yine `1 → 2 → 3` sırasıyla çalıştır.

## 3) Ortam değişkenleri (.env)
Proje kökünde `.env` (repoda `.env.example` şablonu var):
```
VITE_SUPABASE_URL=https://<proje-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```
Değerler: Supabase → **Project Settings → API**. `anon` anahtar herkese açıktır (güvenli),
build'e gömülür — cPanel/WebView için sorun değil.

## 4) Süper admin (ana admin)
- Süper admin e-postası koda gömülü: **epusula.akademi@gmail.com** (`super_admin_email()`).
- Uygulamadan bu e-posta ile **admin** olarak kayıt ol → trigger otomatik `role=admin`,
  `admin_status=approved`, `is_super_admin=true` yapar. Ekstra işlem gerekmez.
- Başka biri **admin** olarak kaydolursa `admin_status=pending` olur ve admin paneline
  giremez. Süper admin, paneldeki **"Bekleyen Admin İstekleri"** kısmından onaylar/reddeder.

### Elle rol/onay (gerekirse SQL)
```sql
-- Bir kullanıcıyı admin yap ve onayla
update public.profiles set role='admin', admin_status='approved'
where id = (select id from auth.users where email='ornek@epusula.net');

-- Süper admini elle işaretle
update public.profiles set is_super_admin=true, role='admin', admin_status='approved'
where email='epusula.akademi@gmail.com';
```

## 5) Şifre sıfırlama ("Şifremi unuttum")
Kod hazır (Login'de "Şifremi unuttum?" → e-posta → link → "Yeni şifre belirle").
Çalışması için Supabase'de:
1. **Authentication → URL Configuration:**
   - **Site URL** = ana site adresin (örn. `https://epusula.com`).
   - **Redirect URLs** allow-list'e ekle: ana site adresin ve (native APK için) `epusula://login`.
2. `.env` içine **`VITE_APP_URL=https://ana-site-adresin/`** ekle (sıfırlama linkinin döneceği adres).
3. **E-posta gönderimi:** Supabase'in yerleşik servisi test için çalışır ama **çok limitli + spam'e düşebilir**.
   Gerçek kullanım için **Authentication → Emails → SMTP Settings**'ten ücretsiz bir SMTP bağla
   (örn. Resend: 3000 mail/ay ücretsiz). Kod aynı kalır; sadece panelden ayar.

> Mobil (APK) kullanıcı sıfırlama linkine tıklarsa link telefonun tarayıcısında ana siteyi açar,
> şifreyi orada değiştirir, sonra uygulamaya yeni şifresiyle girer — ekstra kurulum gerekmez.

## Notlar
- **classes** ve **units** DB'de değil; `src/data/mockData.js` içinde statik durur
  (nadiren değişir, küçük). `questions.class_id/unit_id` bunlara metinle eşleşir.
- Profil fotoğrafı şimdilik `profiles.profile_pic` içinde base64 saklanır.
  (İleride Supabase Storage'a taşınabilir.)
- Kayıtlı kullanıcı sayısı admin panelde Supabase'den okunur. Gerçek **Play Store indirme**
  sayısı koddan alınamaz; yayından sonra **Google Play Console**'dan izlenir.
