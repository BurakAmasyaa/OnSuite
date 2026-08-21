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

## Test

```bash
npm test        # öneri kuralları (node:test)
npm run lint
npx tsc --noEmit
npm run typecheck:recommendation-worker
```

## Öneri motoru nasıl çalışır

İhtiyaç metni iki aşamada modele gider; **model yalnızca seçim yapar, metin üretmez.**

1. **Aşama 1 — ürün seçimi.** Katalogdaki ürünler resmi açıklamalarıyla birlikte modele verilir; model en fazla 3 ürün seçer ve her biri için isteğin hangi kısmını karşıladığını belirtir.
2. **Aşama 2 — modül seçimi.** Yalnızca seçilen ürünlerin modülleri aday olur. Aşama 1'in gerekçesi de iletilir, böylece modüller ürün bazında kapsamlanır. En fazla 6 modül seçilir.
3. **Mimari kuralları (kod, deterministik).** Core her çözüme eklenir; Connect yalnızca makine verisi üreten bir ürün seçildiyse eklenir; Engage bağımsız çözüm olarak ayrılır. Sıralama `lib/architecture.ts`'teki katmanları izler.

Her iki çağrı da `json_schema` + `strict` ile kısıtlıdır: modelin döndürebileceği tek şey ID listesidir. Ekranda görünen tüm metinler (ürün/modül adları, açıklamalar, katman rolleri) `data/` altındaki kanonik JSON'lardan veya `lib/recommend-solution.ts` içindeki sabitlerden gelir. Dolayısıyla modelin uydurma bir OnSuite yeteneği üretmesi yapısal olarak mümkün değildir.

Model erişilemezse veya hiçbir eşleşme bulamazsa, `lib/recommend-solution.ts` içindeki yerel anahtar kelime kuralları yedek olarak devreye girer. `NEXT_PUBLIC_RECOMMENDATION_API_URL` tanımsızsa tüm akış bu yerel kurallarla çalışır.

## Bilinmesi gerekenler

- **Worker herkese açıktır.** CORS yalnızca tarayıcı kaynaklı istekleri kısıtlar; `Origin` başlığı göndermeyen istemciler (curl, sunucu tarafı script) endpoint'i doğrudan çağırabilir. Rate limit yoktur. Kendi dağıtımınızda `ALLOWED_ORIGINS` dışında ek koruma eklemeniz önerilir.
- **Workers AI kotası günlüktür** (00:00 UTC'de sıfırlanır). Sorgu başına maliyet, gönderilen aday listesinin boyutuna bağlıdır; girdinin büyük kısmı Aşama 2'deki modül adaylarından gelir.
- **`data/` altındaki JSON'lar build-time import edilir.** Katalog değişikliği için yeniden derleme gerekir.
- **Ürün açıklamaları yalnızca doğrulanmış kaynaklardan gelmelidir.** `data/product-official-descriptions.json` içindeki her kayıt `sourceUrl` taşır; açıklaması olmayan ürünler modele boş açıklamayla gider ve yalnızca adlarından tanınabilir.
