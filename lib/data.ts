import productsJson from "@/data/products.json";
import modulesJson from "@/data/modules.json";
import sharedModulesJson from "@/data/shared-modules.json";

export type Product = (typeof productsJson)[number];
export type Module = (typeof modulesJson)[number];
export type SharedModule = (typeof sharedModulesJson)[number];

export const products: Product[] = productsJson;
export const modules: Module[] = modulesJson;
export const sharedModules: SharedModule[] = sharedModulesJson;

export function getModulesByProduct(productCode: string) {
  return modules.filter((module) => module.AppProductCode === productCode);
}

export function getProduct(productCode: string) {
  return products.find((product) => product.AppProductCode === productCode);
}
