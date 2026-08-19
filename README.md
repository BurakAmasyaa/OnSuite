# OnSuite Ürün-Modül Haritası

Next.js 14 App Router, TypeScript ve Tailwind CSS tabanlı ürün mimarisi uygulaması.

## Geliştirme

```bash
npm install
npm run dev
```

`data/` altındaki JSON dosyaları `lib/data.ts` üzerinden build-time import edilir.

Cloudflare uyumlu OpenNext çıktısı için `npm run build:worker` kullanılabilir.

İhtiyaç bazlı recommendation Worker'ı yerelde çalıştırmak için `npm run worker:recommendation:dev` kullanılabilir.
Ana uygulama, `NEXT_PUBLIC_RECOMMENDATION_API_URL` tanımlı değilse otomatik olarak local recommendation fallback'ini kullanır.

Worker deploy öncesinde Wrangler ile giriş yapıp production origin'ini belirtin:

```bash
npx wrangler login
npx wrangler deploy --config cloudflare/recommendation-worker/wrangler.jsonc --var ALLOWED_ORIGINS:http://localhost:3000,https://on-suite.vercel.app
```

Sonra Next.js build ortamında `NEXT_PUBLIC_RECOMMENDATION_API_URL` değerini Worker URL'si ile tanımlayın.
