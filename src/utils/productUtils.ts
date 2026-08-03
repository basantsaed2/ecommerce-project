import { Product, Sku } from "@/types/api";

export interface ParsedProductPrice {
  mainPrice: number;
  finalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  discountAmount: number;
  discountLabel?: string;
}

export function getProductPriceInfo(product: Product, sku?: Sku | null): ParsedProductPrice {
  if (!product) {
    return {
      mainPrice: 0,
      finalPrice: 0,
      hasDiscount: false,
      discountPercent: 0,
      discountAmount: 0,
    };
  }

  // 1. Base prices from SKU if provided, else from Product
  let mainPrice = sku ? sku.price : (product.main_price ?? product.price ?? 0);
  let finalPrice = sku ? (sku.final_price ?? sku.price_after_discount) : (product.final_price ?? product.price);

  const discountObj = product.discount;
  const discountLabel = discountObj?.name;

  // 2. If finalPrice is missing, try calculating using discount object
  if (finalPrice === undefined || finalPrice === null || finalPrice === mainPrice) {
    if (discountObj && discountObj.amount && discountObj.amount > 0) {
      if (discountObj.type === "percentage") {
        const pct = discountObj.amount <= 1 ? discountObj.amount * 100 : discountObj.amount;
        finalPrice = Math.max(0, mainPrice - (mainPrice * (pct / 100)));
      } else {
        // fixed or amount
        finalPrice = Math.max(0, mainPrice - discountObj.amount);
      }
    } else {
      finalPrice = mainPrice;
    }
  }

  const hasDiscount = mainPrice > finalPrice && finalPrice > 0;
  const discountAmount = hasDiscount ? mainPrice - finalPrice : 0;
  let discountPercent = 0;

  if (hasDiscount && mainPrice > 0) {
    if (discountObj?.type === "percentage" && discountObj?.amount) {
      discountPercent = Math.round(discountObj.amount <= 1 ? discountObj.amount * 100 : discountObj.amount);
    } else {
      discountPercent = Math.round((discountAmount / mainPrice) * 100);
    }
  }

  return {
    mainPrice,
    finalPrice,
    hasDiscount,
    discountPercent,
    discountAmount,
    discountLabel,
  };
}
