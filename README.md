# Epusula — Günlük Matematik Uygulaması

Öğrencilerin her gün 3 matematik sorusu çözdüğü; seri (streak), puan ve liderlik
tablosu ile gamification içeren eğitim uygulaması. Roller: **öğrenci**, **öğretmen**, **admin**.

- **Teknoloji:** React 19 + Vite 8, React Router 7 (HashRouter)
- **Veri (mevcut aşama):** Tamamen istemci tarafı — tarayıcı `localStorage`. Gerçek
  backend yok (Supabase entegrasyonu sonraki aşamada planlanıyor).
- **Sorular:** `src/data/questions/` altında sınıf başına ayrı dosya (6–12. sınıf,
  her biri 60 soru = toplam 420). Günde 3 soru gösterilir ve tarihe bağlı rotasyonla
  her gün değişir (~20 gün tekrarsız).

## Geliştirme

```bash
npm install
npm run dev       # geliştirme sunucusu
npm run build     # üretim derlemesi -> dist/
npm run preview   # dist/ önizlemesi
```

### Demo hesapları (şifre hepsinde: `123`)
| Rol      | E-posta                  |
|----------|--------------------------|
| Öğrenci  | ahmetadil@epusula.net    |
| Öğrenci  | zeynep@epusula.net       |
| Öğretmen | ayse@epusula.net         |
| Admin    | admin@epusula.net        |

> Not: Demo kullanıcılar yalnızca `localStorage` boşken yüklenir. Sıfırlamak için
> tarayıcı konsolundan `localStorage.clear()` çalıştırıp sayfayı yenileyin.

## Paylaşımlı Hosting'e (cPanel) Yükleme

Uygulama statik bir SPA olarak derlenir ve herhangi bir statik web hostingde çalışır.

1. Derle: `npm run build` → çıktı `dist/` klasöründe oluşur.
2. `dist/` klasörünün **içeriğini** (klasörün kendisini değil) cPanel'de
   `public_html/` altına (veya bir alt klasöre, örn. `public_html/epusula/`) yükle.
3. Tarayıcıdan adresi aç. Bitti.

**Neden `.htaccess` gerekmiyor?** Uygulama `HashRouter` kullanır; tüm rotalar
`site.com/#/login` gibi hash üzerinden çalışır. Bu sayede sayfa yenilemede 404
alınmaz ve sunucu yönlendirme kuralı (rewrite) gerektirmez.

**Alt klasör / WebView uyumu:** `vite.config.js` içinde `base: './'` ayarlıdır;
asset yolları görecelidir, bu yüzden hem alt klasörde hem de `file://` (WebView)
altında sorunsuz çalışır.

## Sonraki Aşamalar (planlı)

- **Supabase backend:** Gerçek giriş (Auth), ortak kullanıcı/soru/liderlik verisi,
  admin soru yönetimi. Veri erişimi `src/data/dataService.js` katmanında soyutlandı;
  geçişte yalnızca bu dosyanın içi Supabase çağrılarına çevrilecek.
- **WebView → Play Store:** `dist/` çıktısı Capacitor/Android WebView ile paketlenir.
  HashRouter + `base: './'` sayesinde ek değişiklik gerekmez.

## Proje Yapısı (özet)

```
src/
├── data/
│   ├── dataService.js      # Veri erişim katmanı (UI buradan okur)
│   ├── mockData.js         # Sınıflar, üniteler, demo kullanıcılar
│   ├── questionsData.js    # Geriye dönük yeniden export
│   └── questions/          # Sınıf başına soru bankası
│       ├── class6.js … class12.js
│       └── index.js        # Tümünü birleştirir (allQuestions, QUESTIONS_BY_CLASS)
├── context/AuthContext.jsx # Oturum + localStorage durumu
├── pages/                  # Rota bileşenleri
└── components/Layout.jsx
```
