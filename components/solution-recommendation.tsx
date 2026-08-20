"use client";

import { FormEvent, useState, type CSSProperties } from "react";
import { ProductIcon, productIconByCode } from "@/components/product-icon";
import { getOfficialProductDescription, modules, products } from "@/lib/data";
import { getAIRecommendation } from "@/lib/recommendation-client";
import type { RecommendationResult } from "@/lib/recommend-solution";

const exampleNeeds = ["Verimlilik", "Anlık üretim takibi", "Kalite"];

const productById = new Map(products.map((product) => [product.AppProductCode, product]));
const moduleByKey = new Map(modules.map((module) => [`${module.AppProductCode}:${module.AppModuleCode}`, module]));

function getProductTitle(productId: string) {
  const product = productById.get(productId);
  return product?.ProductTitleTR ?? product?.ProductTitleEN ?? productId;
}

function RecommendationResultView({ result }: { result: RecommendationResult }) {
  const resolvedProducts = result.products
    .map((recommendation) => ({ recommendation, product: productById.get(recommendation.id) }))
    .filter((item) => item.product);
  const resolvedModules = result.modules
    .map((recommendation) => ({
      recommendation,
      module: moduleByKey.get(`${recommendation.productId}:${recommendation.id}`),
    }))
    .filter((item) => item.module);
  const resolvedStandalone = result.standaloneProducts
    .map((recommendation) => ({ recommendation, product: productById.get(recommendation.id) }))
    .filter((item) => item.product);
  const selectedProducts = resolvedProducts
    .map(({ product }) => product?.ProductTitleTR ?? product?.ProductTitleEN)
    .filter(Boolean);
  const solutionPath = [
    "Seçilen ürünler",
    selectedProducts.slice(0, 3).join(" + ") || "Eşleşen ürün yok",
  ];

  if (resolvedProducts.length === 0 && resolvedModules.length === 0 && resolvedStandalone.length === 0) {
    return (
      <div className="solution-recommendation-empty" aria-live="polite">
        <strong>Eşleşen bir OnSuite çözümü bulamadım.</strong>
        <p>Üretimde geliştirmek istediğiniz alanı biraz daha detaylandırarak tekrar deneyebilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="solution-recommendation-result" aria-live="polite">
      <p className="eyebrow">Önerilen çözüm</p>
      <p className="solution-recommendation-summary">İhtiyacınıza göre aşağıdaki OnSuite ürün ve modülleri eşleşti.</p>
      {result.solutionNarrative ? (
        <p className="solution-recommendation-narrative">{result.solutionNarrative}</p>
      ) : null}

      {resolvedProducts.length > 0 ? (
        <div className="solution-result-group">
          <h3>Önerilen Ana Ürünler</h3>
          <div className="solution-product-grid">
            {resolvedProducts.map(({ recommendation, product }, index) => {
              const productId = recommendation.id;
              const icon = productIconByCode[product!.AppProductCode];
              const officialDescription = getOfficialProductDescription(productId);

              return (
                <article
                  className="solution-product-card"
                  key={productId}
                  style={{ "--reveal-delay": `${index * 60}ms` } as CSSProperties}
                >
                  {icon ? <ProductIcon icon={icon} /> : null}
                  <div>
                    <h4>{getProductTitle(productId)}</h4>
                    {officialDescription ? <p>{officialDescription}</p> : null}
                    <a href="/harita#products-section-title">Katalogda görüntüle</a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {resolvedModules.length > 0 ? (
        <div className="solution-result-group">
          <h3>Önerilen Modüller</h3>
          <div className="solution-module-list">
            {resolvedModules.map(({ recommendation, module }, index) => {
              const moduleDescription = module!.ModuleShortDescriptionTR ?? module!.ModuleShortDescriptionEN;

              return (
                <article
                  className="solution-module-item"
                  key={`${recommendation.productId}:${recommendation.id}`}
                  style={{ "--reveal-delay": `${(resolvedProducts.length + index) * 60}ms` } as CSSProperties}
                >
                  <div>
                    <strong>{module!.ModuleTitleTR ?? module!.ModuleTitleEN ?? recommendation.id}</strong>
                    <span>{getProductTitle(recommendation.productId)}</span>
                  </div>
                  {moduleDescription ? <p>{moduleDescription}</p> : null}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {resolvedProducts.length > 0 || resolvedModules.length > 0 ? (
        <div className="solution-result-group solution-path-group">
          <h3>Önerilen OnSuite Yapısı</h3>
          <div className="solution-path" aria-label={solutionPath.join(", ardından ")}>
            {solutionPath.map((step, index) => (
              <div className="solution-path-step" key={step}>
                <span>{step}</span>
                {index < solutionPath.length - 1 ? <b aria-hidden="true">→</b> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {resolvedStandalone.length > 0 ? (
        <div className="solution-result-group solution-standalone-group">
          <h3>Ayrıca değerlendirebilirsiniz</h3>
          <p className="solution-standalone-note">Bu çözüm diğer modüllerden bağımsız olarak kullanılır.</p>
          <div className="solution-product-grid">
            {resolvedStandalone.map(({ recommendation, product }) => {
              const productId = recommendation.id;
              const icon = productIconByCode[product!.AppProductCode];
              const officialDescription = getOfficialProductDescription(productId);

              return (
                <article className="solution-product-card" key={productId}>
                  {icon ? <ProductIcon icon={icon} /> : null}
                  <div>
                    <h4>{getProductTitle(productId)}</h4>
                    {officialDescription ? <p>{officialDescription}</p> : null}
                    <a href="/harita#products-section-title">Katalogda görüntüle</a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** The local fast path resolves almost instantly; showing the progress text
 * for those would just make it flash. Only surface it once a request has been
 * running long enough to read as waiting. */
const LOADING_VISIBLE_DELAY_MS = 200;

export function SolutionRecommendation() {
  const [userNeed, setUserNeed] = useState("");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingState, setShowLoadingState] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedNeed = userNeed.trim();

    if (isLoading) {
      return;
    }

    if (!trimmedNeed) {
      setResult(null);
      setValidationMessage("Öneri alabilmek için üretimde çözmek istediğiniz ihtiyacı yazın.");
      return;
    }

    setValidationMessage("");
    setIsLoading(true);
    setResult(null);
    const loadingTimer = window.setTimeout(() => setShowLoadingState(true), LOADING_VISIBLE_DELAY_MS);

    try {
      setResult(await getAIRecommendation(trimmedNeed));
    } finally {
      window.clearTimeout(loadingTimer);
      setShowLoadingState(false);
      setIsLoading(false);
    }
  };

  return (
    <section className="solution-recommendation" aria-labelledby="solution-recommendation-title">
      <header className="solution-recommendation-heading">
        <p className="eyebrow">İhtiyaç bazlı çözüm</p>
        <h2 id="solution-recommendation-title">İhtiyacınızı anlatın</h2>
      </header>

      <form className="solution-recommendation-form" onSubmit={handleSubmit}>
        <textarea
          id="solution-need"
          aria-label="İhtiyacınızı yazın"
          value={userNeed}
          onChange={(event) => setUserNeed(event.target.value)}
          placeholder="Üretimde geliştirmek istediğiniz alanı yazın..."
          rows={3}
        />
        <div className="solution-example-list" aria-label="Örnek ihtiyaçlar">
          <span>Örn:</span>
          {exampleNeeds.map((example) => (
            <button type="button" className="solution-example" key={example} onClick={() => setUserNeed(example)} aria-label={`${example} örneğini kullan`}>
              {example}
            </button>
          ))}
          <button className="solution-submit" type="submit" aria-label="Çözüm öner" disabled={isLoading}>
            {isLoading ? "..." : "→"}
          </button>
        </div>
        <div className="solution-form-footer">
          {validationMessage ? <p className="solution-validation" role="alert">{validationMessage}</p> : null}
        </div>
      </form>

      {showLoadingState ? (
        <div className="solution-recommendation-loading" role="status" aria-live="polite">
          <p className="solution-loading-label">
            <span className="solution-loading-spinner" aria-hidden="true" />
            Sizin için çözüm üretiliyor...
          </p>
          <div className="solution-loading-skeleton" aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>
      ) : null}

      {result && !showLoadingState ? <RecommendationResultView result={result} /> : null}
    </section>
  );
}