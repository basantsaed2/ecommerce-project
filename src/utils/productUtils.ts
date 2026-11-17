import { Product, Sku } from "@/types/api";

export interface ParsedProductPrice {
  mainPrice: number;
  finalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  discountAmount: number;
  discountLabel?: string;
}

interface StockProduct {
  _id?: string;
  quantity?: number;
  skus?: Array<Pick<Sku, "quantity" | "option_ids">>;
  variations?: Array<{
    options?: Array<{
      _id: string;
      quantity?: number;
    }>;
  }>;
}

interface StockVariant {
  _id?: string;
  quantity?: number;
  option_ids?: string[];
  selectedVariations?: Array<{ optionId?: string }>;
}

export function getProductAvailableStock(
  product: StockProduct | null | undefined,
  variant?: StockVariant | null,
): number | undefined {
  if (typeof variant?.quantity === "number" && Number.isFinite(variant.quantity)) {
    return Math.max(0, variant.quantity);
  }

  const selectedOptionIds = variant?.option_ids?.length
    ? variant.option_ids
    : variant?.selectedVariations?.map((variation) => variation.optionId).filter((id): id is string => Boolean(id)) || [];
  const productQuantity = typeof product?.quantity === "number" && Number.isFinite(product.quantity)
    ? Math.max(0, product.quantity)
    : undefined;

  if (selectedOptionIds.length > 0) {
    const matchingSku = product?.skus?.find((sku) =>
      selectedOptionIds.every((optionId) => sku.option_ids.includes(optionId))
    );
    if (matchingSku) {
      return Math.max(0, matchingSku.quantity);
    }

    const selectedOptionStocks = product?.variations
      ?.flatMap((variation) => variation.options || [])
      .filter((option) => selectedOptionIds.includes(option._id))
      .map((option) => option.quantity)
      .filter((quantity): quantity is number => typeof quantity === "number" && Number.isFinite(quantity))
      .map((quantity) => Math.max(0, quantity)) || [];

    if (selectedOptionStocks.length > 0) {
      return Math.min(
        ...selectedOptionStocks,
        ...(productQuantity !== undefined && productQuantity > 0 ? [productQuantity] : []),
      );
    }
  }

  if (productQuantity !== undefined && productQuantity > 0) {
    return productQuantity;
  }

  const availableSkuStocks = product?.skus
    ?.map((sku) => Math.max(0, sku.quantity))
    .filter((quantity) => quantity > 0 && Number.isFinite(quantity)) || [];
  if (availableSkuStocks.length > 0) {
    return Math.max(...availableSkuStocks);
  }

  return productQuantity;
}

export function getProductPriceInfo(
  product: Product,
  sku?: Partial<Pick<Sku, "price" | "final_price" | "price_after_discount">> | null,
): ParsedProductPrice {
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
  const mainPrice = sku?.price ?? product.main_price ?? product.price ?? 0;
  let finalPrice = sku
    ? (sku.final_price ?? sku.price_after_discount)
    : (product.final_price ?? product.price);

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
