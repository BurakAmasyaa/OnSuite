import productsJson from "@/data/products.json";
import modulesJson from "@/data/modules.json";
import sharedModulesJson from "@/data/shared-modules.json";
import productOfficialDescriptionsJson from "@/data/product-official-descriptions.json";

export type Product = (typeof productsJson)[number];
export type Module = (typeof modulesJson)[number];
export type SharedModule = (typeof sharedModulesJson)[number];
export type ProductOfficialDescription = (typeof productOfficialDescriptionsJson)[number];

export const products: Product[] = productsJson;
export const modules: Module[] = modulesJson;
export const sharedModules: SharedModule[] = sharedModulesJson;
export const productOfficialDescriptions: ProductOfficialDescription[] = productOfficialDescriptionsJson;

const productOfficialDescriptionByCode = new Map(
  productOfficialDescriptions.map((entry) => [entry.productCode, entry]),
);

export function getModulesByProduct(productCode: string) {
  return modules.filter((module) => module.AppProductCode === productCode);
}

export function getProduct(productCode: string) {
  return products.find((product) => product.AppProductCode === productCode);
}

/**
 * Short official product description sourced from onsuite.com.tr (see
 * data/product-official-descriptions.json for the source URL per product).
 * Returns undefined when no official page has been verified for the product
 * yet — callers must not fabricate a substitute.
 */
export function getOfficialProductDescription(productCode: string) {
  return productOfficialDescriptionByCode.get(productCode)?.description;
}
