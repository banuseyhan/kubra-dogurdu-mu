# Kübra Doğurdu Mu?

Basit bir durum sitesi. Ana sayfa herkesin cevabı görmesi için kullanılır; sağ üstteki menüden şifreyle admin paneli açılır.

## Çalıştırma

```bash
ADMIN_PASSWORD=guclu-bir-sifre node server.js
```

Sonra:

- Site: `http://localhost:3000`
- Admin: sağ üstteki menü

Admin şifresi `ADMIN_PASSWORD` ile belirlenir. Ortam değişkeni verilmezse geliştirme için varsayılan şifre `sivaslıpars2026` olur.

## Yayınlama

Netlify'de yayınlamak için build ayarları `netlify.toml` içinde hazırdır:

- Publish directory: `public`
- Functions directory: `netlify/functions`
- API redirect: `/api/status`

Netlify Project configuration > Environment variables bölümünden `ADMIN_PASSWORD` değerini ayarlayın. Ayarlamazsanız varsayılan şifre `sivaslıpars2026` olur.

Yerelde basit Node server ile çalıştırmak için `npm start` kullanabilirsiniz.
