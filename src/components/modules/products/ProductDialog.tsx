"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useGet } from '@/hooks/useGet';
import { Product, SingleApiResponse } from '@/types/api';
import { Loader2, X, Plus, Minus, ShoppingCart, Zap, Tag, Box, Award, Star } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, syncCart } from '@/store/slices/cartSlice';
import { RootState, AppDispatch } from '@/store/store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getProductPriceInfo } from '@/utils/productUtils';

interface ProductDialogProps {
    productId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductDialog({ productId, isOpen, onClose }: ProductDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const token = useSelector((state: RootState) => state.auth.token);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isBuyingNow, setIsBuyingNow] = useState(false);

    const { data, isLoading, error } = useGet<SingleApiResponse<Product>>(
        ['product', productId],
        `/product/${productId}`,
        { enabled: isOpen }
    );

    if (!isOpen) return null;

    const product = data?.data?.data;

    const productQuantity = product?.quantity ?? 0;

    // Product has stock if product.quantity > 0 or if any SKU has stock
    const hasAvailableStock = productQuantity > 0 || (product?.skus?.some(sku => (sku.quantity ?? 0) > 0) ?? false);
    const hasVariantStock = hasAvailableStock;

    const getSkuStock = (sku: any): number => {
        if (!sku) return productQuantity;
        return (sku.quantity && sku.quantity > 0) ? sku.quantity : productQuantity;
    };

    useEffect(() => {
        if (hasAvailableStock && product?.variations && product.variations.length > 0 && Object.keys(selectedOptions).length === 0) {
            const inStockSku = product.skus?.find(sku => getSkuStock(sku) > 0);
            const initialOptions: Record<string, string> = {};

            if (inStockSku) {
                product.variations.forEach(v => {
                    const matchedOption = v.options.find(opt => inStockSku.option_ids.includes(opt._id));
                    if (matchedOption) {
                        initialOptions[v._id] = matchedOption._id;
                    } else if (v.options.length > 0) {
                        initialOptions[v._id] = v.options[0]._id;
                    }
                });
            } else {
                product.variations.forEach(v => {
                    if (v.options.length > 0) {
                        initialOptions[v._id] = v.options[0]._id;
                    }
                });
            }
            setSelectedOptions(initialOptions);
        }
    }, [hasAvailableStock, product, selectedOptions]);

    const currentSkuObj = useMemo(() => {
        if (!product?.skus) return null;

        const selectedOptionIds = Object.values(selectedOptions);
        if (selectedOptionIds.length === 0) return null;

        return product.skus.find(sku => {
            if (getSkuStock(sku) <= 0) return false;
            return selectedOptionIds.every(id => sku.option_ids.includes(id));
        }) ?? null;
    }, [product, selectedOptions]);

    const priceInfo = useMemo(() => {
        return getProductPriceInfo(product as Product, currentSkuObj);
    }, [product, currentSkuObj]);

    const isOutOfStock = !hasAvailableStock || (currentSkuObj ? getSkuStock(currentSkuObj) <= 0 : productQuantity <= 0);

    const isOptionInStock = (optionId: string): boolean => {
        if (!product?.skus) return productQuantity > 0;
        return product.skus.some(sku =>
            getSkuStock(sku) > 0 && sku.option_ids.includes(optionId)
        );
    };

    const handleAddToCart = () => {
        if (!product) return;

        if (isOutOfStock) {
            toast.error('This combination is currently sold out');
            return;
        }

        dispatch(addItem({
            product: product,
            variant: currentSkuObj || undefined,
            quantity: quantity
        }));

        dispatch(syncCart());
        toast.success(`Added to cart`);
        onClose();
    };

    const handleBuyNow = async () => {
        if (!product) return;

        if (isOutOfStock) {
            toast.error('This combination is currently sold out');
            return;
        }

        setIsBuyingNow(true);
        dispatch(addItem({
            product: product,
            variant: currentSkuObj || undefined,
            quantity: quantity
        }));

        await dispatch(syncCart());
        setIsBuyingNow(false);
        onClose();
        router.push('/cart');
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-y-auto md:overflow-hidden relative flex flex-col md:flex-row transform transition-all max-h-[95vh] md:max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[110] p-2.5 bg-white/90 backdrop-blur-sm hover:bg-red-500 text-gray-600 hover:text-white rounded-full transition-all active:scale-95 shadow-md border border-gray-100"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                {isLoading || !product ? (
                    <div className="w-full h-96 flex items-center justify-center">
                        <Loader2 className="animate-spin text-secondary" size={40} />
                    </div>
                ) : (
                    <>
                        {/* Image Panel */}
                        <div className="w-full md:w-1/2 md:border-r border-gray-100 bg-gray-50 flex flex-col items-center justify-center p-6 md:p-10 relative shrink-0">
                            <div className="relative w-full aspect-square flex items-center justify-center mb-6">
                                {/* Discount badge */}
                                {priceInfo.hasDiscount && (
                                    <div className="absolute top-0 left-0 z-10 bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-md flex items-center gap-1">
                                        <Tag size={12} className="fill-current" />
                                        -{priceInfo.discountPercent}% OFF
                                    </div>
                                )}

                                <img
                                    src={selectedImage || product.image}
                                    alt={product.name || product.ar_name}
                                    className={`max-w-full max-h-full object-contain drop-shadow-xl transition-all duration-500 ${product.quantity > 0 ? 'hover:scale-105' : 'grayscale opacity-60'}`}
                                />
                                {product.quantity <= 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-3xl">
                                        <div className="bg-red-500 text-white font-black px-6 py-2 rounded-xl transform -rotate-12 shadow-xl text-lg tracking-widest uppercase border-4 border-white">
                                            Out of Stock
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Gallery Thumbnails */}
                            {(product.gallery_product && product.gallery_product.length > 0) && (
                                <div className="flex flex-wrap justify-center gap-2 mt-auto w-full">
                                    {[product.image, ...product.gallery_product].map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`w-12 h-12 rounded-xl border-2 transition-all overflow-hidden bg-white p-1 ${(selectedImage === img || (!selectedImage && img === product.image))
                                                ? 'border-secondary shadow-md scale-105'
                                                : 'border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-contain" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content Panel */}
                        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between md:overflow-y-auto">
                            <div>
                                {/* Brand & Category tags */}
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    {product.brand?.name && (
                                        <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                                            <Award size={10} className="text-gray-400" />
                                            {product.brand.name}
                                        </span>
                                    )}
                                    {product.category?.name && (
                                        <span className="text-[10px] font-black text-secondary bg-secondary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                            {product.category.name}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-xl md:text-2xl font-black text-primary mb-2 leading-tight">
                                    {product.name || product.ar_name}
                                </h1>

                                {/* Price Box */}
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-3xl font-black text-secondary">
                                        {priceInfo.finalPrice.toLocaleString()} EGP
                                    </span>
                                    {priceInfo.hasDiscount && (
                                        <span className="text-base font-bold text-gray-400 line-through">
                                            {priceInfo.mainPrice.toLocaleString()} EGP
                                        </span>
                                    )}
                                </div>

                                {product.description && (
                                    <p className="text-gray-500 text-xs mb-6 leading-relaxed line-clamp-3">
                                        {product.description}
                                    </p>
                                )}

                                {/* Variations */}
                                {hasVariantStock && product?.variations && product.variations.length > 0 && (
                                    <div className="space-y-4 mb-6">
                                        {product.variations.map(variation => (
                                            <div key={variation._id}>
                                                <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">
                                                    {variation.name}
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {variation.options.map(option => {
                                                        const inStock = isOptionInStock(option._id);
                                                        const isSelected = selectedOptions[variation._id] === option._id;
                                                        return (
                                                            <button
                                                                key={option._id}
                                                                onClick={() => setSelectedOptions(prev => ({ ...prev, [variation._id]: option._id }))}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 flex flex-col items-center ${isSelected
                                                                    ? 'bg-secondary border-secondary text-white shadow-md'
                                                                    : !inStock
                                                                        ? 'bg-gray-50 border-gray-100 text-gray-300 opacity-60'
                                                                        : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                                                                    }`}
                                                            >
                                                                <span>{option.name}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="space-y-4 mt-auto">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</label>
                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-1 shadow-inner">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-primary hover:text-secondary active:scale-90"
                                        >
                                            <Minus size={14} strokeWidth={2.5} />
                                        </button>
                                        <span className="w-6 text-center font-black text-sm">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-primary hover:text-secondary active:scale-90"
                                        >
                                            <Plus size={14} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isOutOfStock}
                                        className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] border-2 ${!isOutOfStock
                                            ? 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                                            : 'bg-gray-100 text-gray-300 cursor-not-allowed border-gray-100 shadow-none'
                                            }`}
                                    >
                                        <ShoppingCart size={16} strokeWidth={2.5} />
                                        {!isOutOfStock
                                            ? `ADD TO CART • ${((priceInfo.finalPrice) * quantity).toLocaleString()} EGP`
                                            : 'OUT OF STOCK'
                                        }
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        disabled={isOutOfStock || isBuyingNow}
                                        className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${!isOutOfStock
                                            ? 'bg-secondary text-white hover:bg-primary'
                                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                            }`}
                                    >
                                        {isBuyingNow
                                            ? <Loader2 size={16} className="animate-spin" />
                                            : <Zap size={16} strokeWidth={2.5} />
                                        }
                                        {isBuyingNow ? 'Processing...' : (isOutOfStock ? 'OUT OF STOCK' : 'BUY NOW')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
