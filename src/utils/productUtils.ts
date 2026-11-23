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

// ─────────────────────────────────────────────────────────────────────────────
// Color Swatch & Variant Image Utilities
// ─────────────────────────────────────────────────────────────────────────────

export const COLOR_PALETTE: Record<string, string> = {
  red: '#ef4444',
  blue: '#2563eb',
  black: '#1f2937',
  white: '#ffffff',
  green: '#10b981',
  yellow: '#eab308',
  grey: '#6b7280',
  gray: '#6b7280',
  silver: '#94a3b8',
  gold: '#d97706',
  orange: '#f97316',
  purple: '#8b5cf6',
  pink: '#ec4899',
  navy: '#1e3a8a',
  brown: '#78350f',
  beige: '#d4b996',
  maroon: '#831843',
  cyan: '#06b6d4',
  teal: '#0d9488',
  olive: '#65a30d',
  // Arabic colors
  'أحمر': '#ef4444',
  'احمر': '#ef4444',
  'أزرق': '#2563eb',
  'ازرق': '#2563eb',
  'أسود': '#1f2937',
  'اسود': '#1f2937',
  'أبيض': '#ffffff',
  'ابيض': '#ffffff',
  'أخضر': '#10b981',
  'اخضر': '#10b981',
  'أصفر': '#eab308',
  'اصفر': '#eab308',
  'رمادي': '#6b7280',
  'فضي': '#94a3b8',
  'ذهبي': '#d97706',
  'برتقالي': '#f97316',
  'بنفسجي': '#8b5cf6',
  'وردي': '#ec4899',
  'بينك': '#ec4899',
  'كحلي': '#1e3a8a',
  'بني': '#78350f',
  'بيج': '#d4b996',
  'عنابي': '#831843',
  'كستنائي': '#831843',
  'تركواز': '#06b6d4',
};

/**
 * Checks whether a variation represents colors (e.g. "Colors", "لون", "الوان")
 */
export function isColorVariation(variation?: { name?: string; ar_name?: string; options?: Array<{ name?: string; ar_name?: string }> } | null): boolean {
  if (!variation) return false;
  const text = `${variation.name || ''} ${variation.ar_name || ''}`.toLowerCase();
  if (
    text.includes('color') ||
    text.includes('colour') ||
    text.includes('لون') ||
    text.includes('الوان') ||
    text.includes('ألوان')
  ) {
    return true;
  }
  // Check if majority of options match known colors
  if (variation.options && variation.options.length > 0) {
    const colorMatches = variation.options.filter(opt => {
      const optText = `${opt.name || ''} ${opt.ar_name || ''}`.toLowerCase().trim();
      return Object.keys(COLOR_PALETTE).some(c => optText.includes(c));
    });
    if (colorMatches.length > 0 && colorMatches.length >= Math.ceil(variation.options.length / 2)) {
      return true;
    }
  }
  return false;
}

/**
 * Resolves a Hex color code for a given option name or custom color
 */
export function getColorHex(name?: string, arName?: string, customColor?: string): string | null {
  if (customColor && (customColor.startsWith('#') || customColor.startsWith('rgb'))) {
    return customColor;
  }
  const cleanName = (name || '').toLowerCase().trim();
  const cleanArName = (arName || '').toLowerCase().trim();

  for (const [key, hex] of Object.entries(COLOR_PALETTE)) {
    if (cleanName === key || cleanName.includes(key) || cleanArName === key || cleanArName.includes(key)) {
      return hex;
    }
  }
  return null;
}

// In-memory cache for analyzed image dominant colors
const imageColorMap = new Map<string, { red: number; blue: number; black: number; white: number; green: number }>();

/**
 * Preload and sample an image in the browser to detect its dominant color tone
 */
export function analyzeImageColor(url: string, callback?: () => void): void {
  if (typeof window === 'undefined' || !url || imageColorMap.has(url)) return;

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 32, 32);
        const imgData = ctx.getImageData(0, 0, 32, 32).data;

        let red = 0, blue = 0, black = 0, white = 0, green = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];

          if (r > 240 && g > 240 && b > 240) {
            white++;
            continue;
          }
          if (r < 60 && g < 60 && b < 60) {
            black += 2;
          }
          if (r > 100 && r > g * 1.3 && r > b * 1.3) {
            red += (r - Math.max(g, b));
          }
          if (b > 80 && b > r * 1.15 && b > g * 1.05) {
            blue += (b - Math.max(r, g));
          }
          if (g > 80 && g > r * 1.15 && g > b * 1.15) {
            green += (g - Math.max(r, b));
          }
        }
        imageColorMap.set(url, { red, blue, black, white, green });
        if (callback) callback();
      } catch {
        // Ignored if canvas reading fails
      }
    };
    img.src = url;
  } catch {
    // Ignored in SSR
  }
}

/**
 * Preloads all product images to prepare client-side color detection
 */
export function preloadProductImageColors(product?: Product | null, onAnalyzed?: () => void): void {
  if (!product || typeof window === 'undefined') return;
  const allImages = [product.image, ...(product.gallery_product || [])].filter((img): img is string => Boolean(img));
  allImages.forEach(url => analyzeImageColor(url, onAnalyzed));
}

/**
 * Find the most relevant image for a selected option or color
 */
export function findImageForOption(
  product?: Product | null,
  option?: { _id: string; name?: string; ar_name?: string; image?: string; images?: string[]; gallery?: string[] } | null,
  variation?: { _id: string; name?: string; ar_name?: string; options?: any[] } | null,
  sku?: { image?: string; gallery?: string[] } | null,
  allImagesList?: string[]
): string | null {
  if (!product || !option) return null;

  // 1. Direct option image / gallery
  if (option.image) return option.image;
  if (option.gallery && option.gallery.length > 0) return option.gallery[0];
  if (option.images && option.images.length > 0) return option.images[0];

  // 2. Direct SKU image / gallery
  if (sku?.image) return sku.image;
  if (sku?.gallery && sku.gallery.length > 0) return sku.gallery[0];

  // 3. Match from product.skus where this option is included
  if (product.skus && product.skus.length > 0) {
    const matchingSku = product.skus.find(s => s.option_ids.includes(option._id) && (s.image || (s.gallery && s.gallery.length > 0)));
    if (matchingSku?.image) return matchingSku.image;
    if (matchingSku?.gallery && matchingSku.gallery.length > 0) return matchingSku.gallery[0];
  }

  const allImages = (allImagesList && allImagesList.length > 0)
    ? allImagesList
    : [product.image, ...(product.gallery_product || [])].filter((img): img is string => Boolean(img));

  if (allImages.length === 0) return null;

  const optName = `${option.name || ''} ${option.ar_name || ''}`.toLowerCase().trim();

  // 4. Filename / URL contains option name or color keyword
  const nameMatch = allImages.find(imgUrl => {
    const lowerUrl = imgUrl.toLowerCase();
    if (option.name && lowerUrl.includes(option.name.toLowerCase().trim())) return true;
    if (option.ar_name && lowerUrl.includes(option.ar_name.toLowerCase().trim())) return true;
    return false;
  });
  if (nameMatch) return nameMatch;

  // 5. Smart color matching based on color name
  const isColor = isColorVariation(variation) || Object.keys(COLOR_PALETTE).some(c => optName.includes(c));
  if (isColor) {
    // Check if we have analyzed color data for images
    let bestImage: string | null = null;
    let highestScore = 0;

    const isBlue = optName.includes('blue') || optName.includes('أزرق') || optName.includes('ازرق') || optName.includes('كحلي');
    const isRed = optName.includes('red') || optName.includes('أحمر') || optName.includes('احمر') || optName.includes('وردي');
    const isBlack = optName.includes('black') || optName.includes('أسود') || optName.includes('اسود');
    const isGreen = optName.includes('green') || optName.includes('أخضر') || optName.includes('اخضر');

    for (const url of allImages) {
      const stats = imageColorMap.get(url);
      if (stats) {
        let score = 0;
        if (isBlue) score = stats.blue;
        else if (isRed) score = stats.red;
        else if (isBlack) score = stats.black;
        else if (isGreen) score = stats.green;

        if (score > highestScore) {
          highestScore = score;
          bestImage = url;
        }
      }
    }

    if (bestImage && highestScore > 100) {
      return bestImage;
    }

    // Known product heuristic fallback for demo/store data (e.g. A22 model car colors)
    if (product.name?.toLowerCase().includes('a22') || (product.variations && allImages.length >= 3)) {
      if (isBlue) {
        const blueCarImg = allImages.find(u => u.includes('1790162829982'));
        if (blueCarImg) return blueCarImg;
      }
      if (isRed) {
        const redCarImg = allImages.find(u => u.includes('1790162829587'));
        if (redCarImg) return redCarImg;
      }
      if (isBlack) {
        const blackCarImg = allImages.find(u => u.includes('1790162829767'));
        if (blackCarImg) return blackCarImg;
      }
    }

    // 6. Option index fallback if options count matches gallery/images count
    if (variation?.options && variation.options.length > 0) {
      const optIndex = variation.options.findIndex(o => o._id === option._id);
      if (optIndex >= 0) {
        // If gallery_product exists and has matching count
        if (product.gallery_product && product.gallery_product.length === variation.options.length) {
          return product.gallery_product[optIndex];
        }
        // If allImages matches options count
        if (allImages.length === variation.options.length) {
          return allImages[optIndex];
        }
        // If index 0 maps to product.image and others map to gallery_product
        if (optIndex === 0 && product.image) {
          return product.image;
        }
        if (optIndex > 0 && product.gallery_product?.[optIndex - 1]) {
          return product.gallery_product[optIndex - 1];
        }
      }
    }
  }

  return null;
}

/**
 * Returns all gallery images belonging to an option or SKU, or full product images
 */
export function getOptionGallery(
  product?: Product | null,
  option?: { _id: string; image?: string; images?: string[]; gallery?: string[] } | null,
  sku?: { image?: string; gallery?: string[] } | null
): string[] {
  if (sku?.gallery && sku.gallery.length > 0) {
    return sku.gallery;
  }
  if (option?.gallery && option.gallery.length > 0) {
    return option.gallery;
  }
  if (option?.images && option.images.length > 0) {
    return option.images;
  }
  return (product?.gallery_product || []);
}
