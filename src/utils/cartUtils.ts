export interface CartItemVariationInfo {
    name: string;
    value: string;
}

/**
 * Extracts variation names and values (e.g. Size: 90 * 190) from any cart item
 */
export function getCartItemVariations(item: any, isRtl: boolean = false): CartItemVariationInfo[] {
    if (!item) return [];
    const results: CartItemVariationInfo[] = [];

    // 1. If explicit selectedVariations array is saved
    const explicitVariations = item.variant?.selectedVariations || item.selectedVariations;
    if (Array.isArray(explicitVariations) && explicitVariations.length > 0) {
        return explicitVariations.map((v: any) => ({
            name: isRtl 
                ? (v.ar_variationName || v.variationName || v.name || 'المقاس') 
                : (v.variationName || v.ar_variationName || v.name || 'Size'),
            value: isRtl 
                ? (v.ar_optionName || v.optionName || v.value) 
                : (v.optionName || v.ar_optionName || v.value),
        }));
    }

    // 2. If item.variant has options array
    if (Array.isArray(item.variant?.options) && item.variant.options.length > 0) {
        item.variant.options.forEach((opt: any) => {
            results.push({
                name: isRtl ? (opt.ar_name || opt.name || 'الخاصية') : (opt.name || opt.ar_name || 'Option'),
                value: isRtl ? (opt.ar_value || opt.value || opt.ar_name || opt.name) : (opt.value || opt.ar_value || opt.name || opt.ar_name),
            });
        });
        if (results.length > 0) return results;
    }

    // 3. Match from product.variations and SKU option_ids
    const product = item.product;
    const variant = item.variant;
    const skuId = variant?._id || item.productVariantId || (typeof variant === 'string' ? variant : null);

    let targetOptionIds: string[] = [];
    if (Array.isArray(variant?.option_ids) && variant.option_ids.length > 0) {
        targetOptionIds = variant.option_ids;
    } else if (product?.skus && skuId) {
        const matchedSku = product.skus.find((s: any) => s._id === skuId || s.sku === skuId || s.code === skuId);
        if (matchedSku?.option_ids) {
            targetOptionIds = matchedSku.option_ids;
        }
    }

    if (targetOptionIds.length > 0 && Array.isArray(product?.variations)) {
        product.variations.forEach((v: any) => {
            const vName = isRtl ? (v.ar_name || v.name) : (v.name || v.ar_name);
            v.options?.forEach((opt: any) => {
                if (targetOptionIds.includes(opt._id)) {
                    const optValue = isRtl ? (opt.ar_name || opt.name) : (opt.name || opt.ar_name);
                    results.push({
                        name: vName,
                        value: optValue,
                    });
                }
            });
        });
        if (results.length > 0) return results;
    }

    // 4. Fallback checks for direct fields like size, color, name
    if (variant?.size || variant?.selectedSize) {
        results.push({
            name: isRtl ? 'المقاس' : 'Size',
            value: String(variant.size || variant.selectedSize),
        });
    }
    if (variant?.name && variant.name !== product?.name) {
        results.push({
            name: isRtl ? 'المقاس' : 'Size',
            value: String(variant.ar_name && isRtl ? variant.ar_name : variant.name),
        });
    } else if (variant?.sku && typeof variant.sku === 'string' && variant.sku.length > 0 && variant.sku !== product?._id) {
        results.push({
            name: isRtl ? 'المقاس/الكود' : 'SKU',
            value: variant.sku,
        });
    }

    return results;
}
