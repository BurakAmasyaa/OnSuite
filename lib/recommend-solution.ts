export type RecommendationProduct = {
  id: string;
  reason: string;
};

export type RecommendationModule = {
  id: string;
  productId: string;
  reason: string;
};

export type RecommendationResult = {
  summary: string;
  products: RecommendationProduct[];
  modules: RecommendationModule[];
};

type RecommendationRule = {
  terms: string[];
  summary: string;
  products: RecommendationProduct[];
  modules: RecommendationModule[];
};

const recommendationRules: RecommendationRule[] = [
  {
    terms: ["verimlilik", "performans", "oee", "duruş", "fire", "bakım"],
    summary: "Üretim performansını ölçülebilir hale getirip kayıpların kaynağını görünür kılacak bir yapı öne çıkıyor.",
    products: [
      { id: "OEE", reason: "OEE ve duruş verilerini birlikte izleyerek üretim performansını iyileştirmeye odaklanır." },
      { id: "MONITORA", reason: "Üretim göstergelerini gerçek zamanlı izleyip performans verisini raporlamaya taşır." },
    ],
    modules: [
      { id: "OEE", productId: "OEE", reason: "Toplam Ekipman Etkinliğini gerçek zamanlı hesaplamak için." },
      { id: "DOWNTIME", productId: "OEE", reason: "Planlı ve plansız duruşları, fire oranlarını ve kayıp nedenlerini takip etmek için." },
      { id: "MAINT", productId: "OEE", reason: "Düzeltici ve önleyici bakım faaliyetlerini performans hedefleriyle ilişkilendirmek için." },
      { id: "TRACEDASHBOARD", productId: "MONITORA", reason: "Üretim göstergelerini ve performans metriklerini tek görünümde izlemek için." },
    ],
  },
  {
    terms: ["anlık", "gerçek zamanlı", "üretim takibi", "izlemek", "izleme"],
    summary: "Sahadaki üretim durumunu anlık olarak izleyip ekiplerin aynı operasyonel görünümle hareket etmesi öneriliyor.",
    products: [
      { id: "MONITORA", reason: "Proses, makine ve hatları gerçek zamanlı izlemek için doğrudan konumlanır." },
      { id: "CONNECTIVITY", reason: "Makinelerden ihtiyaç duyulan üretim verisini güvenilir biçimde toplamak için destek olur." },
    ],
    modules: [
      { id: "RPTREALTIME", productId: "MONITORA", reason: "Prosesleri, makineleri ve hatları anlık olarak izlemek için." },
      { id: "TRACEDASHBOARD", productId: "MONITORA", reason: "Gerçek zamanlı üretim göstergelerini ve performans metriklerini görünür kılmak için." },
      { id: "ALARM", productId: "MONITORA", reason: "Kritik durumlar için hızlı uyarı ve aksiyon akışı kurmak için." },
    ],
  },
  {
    terms: ["kalite", "hata", "kusur", "uygunsuz", "tamir"],
    summary: "Kalite problemlerini erken yakalayıp sorunlu ürünleri kontrol altında tutacak izlenebilir bir süreç öne çıkıyor.",
    products: [
      { id: "İZLENEBILIRLIK", reason: "Ürün ve süreç geçmişini kalite kontrolleriyle birlikte izlenebilir hale getirir." },
      { id: "DSF", reason: "Kontrol ve saha formlarını dijitalleştirerek kalite verisinin düzenli toplanmasını sağlar." },
    ],
    modules: [
      { id: "BLOCKING", productId: "İZLENEBILIRLIK", reason: "Kalite sorunu bulunan ürünleri bloke edip yönetmek için." },
      { id: "CHECKLIST", productId: "İZLENEBILIRLIK", reason: "Kalite kontrol listelerini dijital ortamda uygulamak için." },
      { id: "REPAIR_TRK", productId: "İZLENEBILIRLIK", reason: "Hatalı ürünlerin tamir ve düzeltme adımlarını takip etmek için." },
      { id: "JIDOKA", productId: "İZLENEBILIRLIK", reason: "Hata tespiti ve gerektiğinde hattı durdurma akışını desteklemek için." },
    ],
  },
  {
    terms: ["raporlama", "rapor", "görünürlük", "yönetim", "içgörü"],
    summary: "Operasyonel veriyi rapor, dashboard ve bağlamsal içgörüyle yönetsel kararlara yaklaştıracak bir yapı öneriliyor.",
    products: [
      { id: "MONITORA", reason: "Üretim verilerini rapor ve dashboard görünümünde analiz etmeyi sağlar." },
      { id: "INTELLIGENCE", reason: "Kurumsal verilerden doğal dil ile içgörü ve karar desteği üretir." },
    ],
    modules: [
      { id: "RPTPROCESS", productId: "MONITORA", reason: "Proses verilerini detaylı raporlarla analiz etmek için." },
      { id: "TRACEREPORT", productId: "MONITORA", reason: "Verileri raporlarla görünür hale getirmek için." },
      { id: "TRACEDASHBOARD", productId: "MONITORA", reason: "Üretim ve performans metriklerini yönetsel görünümde toplamak için." },
      { id: "VTINSIGHTQUERY", productId: "INTELLIGENCE", reason: "Teknik bilgi gerektirmeden doğal dil ile veri sorgulamak için." },
      { id: "VTINSIGHTANALYSIS", productId: "INTELLIGENCE", reason: "Bağlam tabanlı analiz ve neden-sonuç içgörüleri üretmek için." },
    ],
  },
  {
    terms: ["enerji", "tüketim", "sürdürülebilirlik"],
    summary: "Enerji tüketimini üretim verisiyle birlikte izleyip sürdürülebilirlik performansını karşılaştırmaya uygun bir yapı öne çıkıyor.",
    products: [
      { id: "OEE", reason: "Birim ürün başına enerji tüketimini üretim performansıyla birlikte değerlendirmeye yardımcı olur." },
      { id: "CARBONIQ", reason: "Sürdürülebilirlik ve emisyon verilerini uçtan uca yönetmek için konumlanır." },
    ],
    modules: [
      { id: "ENERGY", productId: "OEE", reason: "Birim ürün başına enerji tüketimini görünür kılmak için." },
      { id: "ENERGY", productId: "İZLENEBILIRLIK", reason: "Enerji verisini ürün ve süreç izlenebilirliğiyle ilişkilendirmek için." },
      { id: "GRESUS", productId: "CARBONIQ", reason: "Emisyonları hesaplayıp sürdürülebilirlik performansını yönetmek için." },
      { id: "GREINS", productId: "CARBONIQ", reason: "Verileri içgörüye dönüştürüp performansı karşılaştırmak için." },
    ],
  },
  {
    terms: ["izlenebilir", "izlenebilirlik", "parti", "lot", "seri numarası", "ürün takibi"],
    summary: "Ürünün üretimden sevkiyata kadar geçmişini parti, lot veya seri numarası seviyesinde takip edecek bir yapı öneriliyor.",
    products: [
      { id: "İZLENEBILIRLIK", reason: "Ürün ve süreçlerin tam izlenebilirliğini sağlamak için tasarlanmıştır." },
    ],
    modules: [
      { id: "LOT_MGMT", productId: "İZLENEBILIRLIK", reason: "Parti ve lot bazında ürün takibi yapmak için." },
      { id: "SN_MGMT", productId: "İZLENEBILIRLIK", reason: "Ürünleri üretimden sevkiyata kadar seri numarasıyla izlemek için." },
      { id: "TRACEIDENTGATE", productId: "İZLENEBILIRLIK", reason: "RFID veya barkodla yükleme ve sevkiyat doğrulaması yapmak için." },
      { id: "TRACEREPORT", productId: "İZLENEBILIRLIK", reason: "İzlenebilirlik verilerini raporlarla görünür hale getirmek için." },
    ],
  },
];

const normalizeNeed = (need: string) => need
  .toLocaleLowerCase("tr-TR")
  .replace(/[ıİ]/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

export function recommendSolution(userNeed: string): RecommendationResult {
  const normalizedNeed = normalizeNeed(userNeed.trim());

  if (!normalizedNeed) {
    return {
      summary: "İhtiyacınızı birkaç cümleyle anlatın; üretim takibi, verimlilik, kalite, bakım veya raporlama gibi bir alan belirtebilirsiniz.",
      products: [],
      modules: [],
    };
  }

  const matches = recommendationRules
    .map((rule, index) => ({
      rule,
      index,
      score: rule.terms.reduce((score, term) => score + (normalizedNeed.includes(normalizeNeed(term)) ? 1 : 0), 0),
    }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index);

  if (matches.length === 0) {
    return {
      summary: "İhtiyacınızı biraz daha detaylandırabilirsiniz. Üretim takibi, verimlilik, kalite, bakım veya raporlama gibi geliştirmek istediğiniz alanı belirtin.",
      products: [],
      modules: [],
    };
  }

  const products = new Map<string, RecommendationProduct>();
  const modules = new Map<string, RecommendationModule>();

  for (const { rule } of matches) {
    for (const product of rule.products) {
      if (!products.has(product.id)) {
        products.set(product.id, product);
      }
    }

    for (const moduleRecommendation of rule.modules) {
      const key = `${moduleRecommendation.productId}:${moduleRecommendation.id}`;

      if (!modules.has(key)) {
        modules.set(key, moduleRecommendation);
      }
    }
  }

  return {
    summary: matches[0].rule.summary,
    products: [...products.values()].slice(0, 3),
    modules: [...modules.values()].slice(0, 6),
  };
}