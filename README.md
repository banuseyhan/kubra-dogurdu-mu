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

Bu uygulama tek bir Node server olarak çalışır. Render, Railway, Fly.io veya kendi VPS'inizde yayınlayabilirsiniz. `ADMIN_PASSWORD` ortam değişkenini yayınladığınız yerde mutlaka ayarlayın.
