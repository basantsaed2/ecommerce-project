"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGet } from '@/hooks/useGet';
import { Product, SingleApiResponse, Sku } from '@/types/api';
import {
    Loader2, ArrowLeft, ShoppingCart, Zap, Plus, Minus, Heart,
    Share2, Shield, Truck, RotateCcw, Star, Package, Tag, Box, CheckCircle2, Calendar, Award
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, syncCart } from '@/store/slices/cartSlice';
import { RootState, AppDispatch } from '@/store/store';
import { toast } from 'sonner';
import { useGetWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import Link from 'next/link';
import { getProductPriceInfo } from '@/utils/productUtils';

export default function ProductDetailClient() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') ?? '';
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const token = useSelector((state: RootState) => state.auth.token);

    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);

    const { data, isLoading, error } = useGet<SingleApiResponse<Product>>(
        ['product', id],
        `/product/${id}`
    );
    const product = data?.data?.data;

    const { data: wishlistData } = useGetWishlist(!!token);
    const { mutate: toggleWishlist, isPending: isTogglingWishlist } = useToggleWishlist();

    const isInWishlist = (
        wishlistData?.data?.data?.some((item: any) => item._id === product?._id) ??
        product?.is_favorite ??
        false
    );

    const productQuantity = product?.quantity ?? 0;

    // Product has stock if product.quantity > 0 or if any SKU has stock
    const hasAvailableStock = productQuantity > 0 || (product?.skus?.some(sku => (sku.quantity ?? 0) > 0) ?? false);
    const hasVariantStock = hasAvailableStock;

    const getSkuStock = (sku: any): number => {
        if (!sku) return productQuantity;
        return (sku.quantity && sku.quantity > 0) ? sku.quantity : productQuantity;
    };

    // Initialize selected options from the first in-stock SKU
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

    // Match selected options to active SKU
    const currentSkuObj = useMemo(() => {
        if (!product?.skus) return null;
        
        const selectedOptionIds = Object.values(selectedOptions);
        if (selectedOptionIds.length === 0) return null;
        
        return product.skus.find(sku => {
            if (getSkuStock(sku) <= 0) return false;
            return selectedOptionIds.every(id => sku.option_ids.includes(id));
        }) ?? null;
    }, [product, selectedOptions]);

    // Pricing info via helper utility
    const priceInfo = useMemo(() => {
        return getProductPriceInfo(product as Product, currentSkuObj);
    }, [product, currentSkuObj]);

    // Stock state
    const isOutOfStock = !hasAvailableStock || (currentSkuObj ? getSkuStock(currentSkuObj) <= 0 : productQuantity <= 0);

    const isOptionInStock = (optionId: string): boolean => {
        if (!product?.skus) return productQuantity > 0;
        return product.skus.some(sku =>
            getSkuStock(sku) > 0 && sku.option_ids.includes(optionId)
        );
    };

    const handleWishlistToggle = () => {
        if (!token) { toast.error('Please login to save to wishlist'); return; }
        toggleWishlist({ productId: product!._id });
    };

    const handleAddToCart = async () => {
        if (!product || isOutOfStock) {
            if (isOutOfStock) toast.error('This combination is currently sold out');
            return;
        }
        setIsAddingToCart(true);
        dispatch(addItem({
            product: product,
            variant: currentSkuObj || undefined,
            quantity: quantity
        }));
        await dispatch(syncCart());
        setIsAddingToCart(false);
        toast.success('Added to cart');
    };

    const handleBuyNow = async () => {
        if (!product || isOutOfStock) {
            if (isOutOfStock) toast.error('This combination is currently sold out');
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
        router.push('/cart');
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({ title: product?.name, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="text-center">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Loader2 className="animate-spin text-primary" size={36} />
                    </div>
                    <p className="text-gray-500 font-bold">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50/50">
                <div className="text-center max-w-sm">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package size={40} className="text-red-300" />
                    </div>
                    <h1 className="text-2xl font-black text-primary mb-3">Product Not Found</h1>
                    <p className="text-gray-500 mb-8">This product doesn't exist or has been removed.</p>
                    <Link href="/" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const galleryImages = (product.gallery_product && product.gallery_product.length > 0)
        ? product.gallery_product
        : [];
    const allImages = [product.image, ...galleryImages].filter(Boolean);

    const displayedImage = selectedImage || product.image;
    const currentStock = getSkuStock(currentSkuObj);
    const inStock = currentStock > 0;
    const totalPrice = (priceInfo.finalPrice * quantity).toLocaleString();

    return (
        <div className="w-full min-h-screen bg-gray-50/30">
            {/* Breadcrumbs */}
            <div className="w-full px-4 md:px-12 py-4 border-b border-gray-100/60 bg-white">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 flex-wrap max-w-7xl mx-auto">
                    <Link href="/" className="hover:text-primary font-semibold transition-colors">Home</Link>
                    <span>/</span>
                    {product.brand?.name && (
                        <>
                            <span className="font-semibold text-gray-600">{product.brand.name}</span>
                            <span>/</span>
                        </>
                    )}
                    {product.category && (
                        <>
                            <span className="font-semibold text-gray-600">{product.category.name}</span>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-primary font-bold truncate max-w-[200px]">{product.name || product.ar_name}</span>
                </div>
            </div>

            <div className="max-w-8xl mx-auto px-4 md:px-12 py-8">
                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors mb-6 group text-sm"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Catalog
                </button>

                {/* Discount Promo Banner */}
                {priceInfo.hasDiscount && (
                    <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white shadow-lg flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                                <Tag size={20} className="fill-current" />
                            </span>
                            <div>
                                <h4 className="font-black text-base uppercase tracking-wider">
                                    {priceInfo.discountLabel || 'Special Discount'} Available!
                                </h4>
                                <p className="text-xs text-white/90 font-medium">
                                    Get {priceInfo.discountPercent}% off this product today. Limited time offer.
                                </p>
                            </div>
                        </div>
                        <span className="bg-white text-red-600 font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider shadow-sm">
                            Save {priceInfo.discountAmount.toLocaleString()} EGP
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">

                    {/* ─── Left: Image Gallery ─── */}
                    <div className="space-y-4 md:sticky md:top-6">
                        <div className="relative bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm aspect-square flex items-center justify-center p-8 group">
                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                {priceInfo.hasDiscount && (
                                    <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider shadow-md">
                                        -{priceInfo.discountPercent}% OFF
                                    </span>
                                )}
                                {product.is_featured && (
                                    <span className="bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider shadow-md flex items-center gap-1">
                                        🔥 Featured
                                    </span>
                                )}
                                {inStock && currentStock < 5 && (
                                    <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-xl uppercase border border-red-100">
                                        Low Stock ({currentStock})
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                                <button
                                    onClick={handleWishlistToggle}
                                    disabled={isTogglingWishlist}
                                    className={`p-3 rounded-2xl shadow-sm border transition-all active:scale-90 ${isInWishlist
                                        ? 'bg-red-50 border-red-100 text-red-500'
                                        : 'bg-white/90 backdrop-blur-sm border-gray-100 text-gray-400 hover:text-red-500'
                                        }`}
                                    aria-label="Wishlist"
                                >
                                    <Heart size={20} className={isInWishlist ? 'fill-current' : ''} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-3 rounded-2xl shadow-sm border bg-white/90 backdrop-blur-sm border-gray-100 text-gray-400 hover:text-primary transition-all active:scale-90"
                                    aria-label="Share"
                                >
                                    <Share2 size={20} />
                                </button>
                            </div>

                            <img
                                src={displayedImage}
                                alt={product.name || product.ar_name}
                                className={`max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-105 ${!inStock ? 'grayscale opacity-50' : ''}`}
                            />

                            {!inStock && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                    <span className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest rotate-[-12deg] shadow-2xl border-2 border-white">
                                        Out of Stock
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-3 flex-wrap">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`w-16 h-16 rounded-2xl border-2 overflow-hidden bg-white p-1.5 transition-all ${(selectedImage === img || (!selectedImage && img === product.image))
                                            ? 'border-primary shadow-md scale-105'
                                            : 'border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── Right: Product Details & Controls ─── */}
                    <div className="flex flex-col space-y-6">

                        {/* Brand & Category Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {product.brand?.name && (
                                    <span className="text-xs font-black text-gray-600 bg-gray-100 px-3 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                                        <Award size={12} className="text-gray-400" />
                                        {product.brand.name}
                                    </span>
                                )}
                                {product.category?.name && (
                                    <span className="text-xs font-black text-secondary bg-secondary/10 px-3 py-1 rounded-lg uppercase tracking-wider">
                                        {product.category.name}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-black text-primary leading-tight mb-2">
                                {product.name || product.ar_name}
                            </h1>
                            {product.ar_name && product.name !== product.ar_name && (
                                <p className="text-gray-400 font-semibold text-sm mb-3">
                                    {product.ar_name}
                                </p>
                            )}

                            {/* Ratings & Status */}
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={16} className="fill-current" />
                                    <span className="text-gray-900 font-black">4.8</span>
                                    <span className="text-gray-400">(Verified Product)</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1 text-emerald-600">
                                    <CheckCircle2 size={16} />
                                    <span>In Stock & Ready to Ship</span>
                                </div>
                            </div>
                        </div>

                        {/* Price Card */}
                        <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
                            <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                                <span className="text-4xl md:text-5xl font-black text-secondary tracking-tight">
                                    {priceInfo.finalPrice.toLocaleString()}
                                </span>
                                <span className="text-xl font-bold text-gray-400">EGP</span>

                                {priceInfo.hasDiscount && (
                                    <span className="text-xl font-bold text-gray-300 line-through">
                                        {priceInfo.mainPrice.toLocaleString()} EGP
                                    </span>
                                )}
                            </div>

                            {priceInfo.hasDiscount && (
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-lg border border-emerald-200">
                                        Save {priceInfo.discountAmount.toLocaleString()} EGP ({priceInfo.discountPercent}% OFF)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Variations Selector */}
                        {hasVariantStock && product?.variations && product.variations.length > 0 && (
                            <div className="space-y-5 bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
                                {product.variations.map(variation => (
                                    <div key={variation._id}>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                                                Select {variation.name}
                                            </label>
                                            {variation.ar_name && variation.ar_name !== variation.name && (
                                                <span className="text-xs text-gray-400 font-medium">
                                                    ({variation.ar_name})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2.5">
                                            {variation.options.map(option => {
                                                const optionInStock = isOptionInStock(option._id);
                                                const isSelected = selectedOptions[variation._id] === option._id;
                                                return (
                                                    <button
                                                        key={option._id}
                                                        onClick={() => setSelectedOptions(prev => ({ ...prev, [variation._id]: option._id }))}
                                                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2 flex flex-col items-center min-w-[70px] ${isSelected
                                                            ? 'bg-secondary border-secondary text-white shadow-md scale-105'
                                                            : !optionInStock
                                                                ? 'bg-gray-50 border-gray-100 text-gray-300 opacity-60'
                                                                : 'bg-white border-gray-100 text-gray-700 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <span>{option.name}</span>
                                                        {!optionInStock && <span className="text-[9px] opacity-70">Sold Out</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        {(product.description || product.ar_description) && (
                            <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
                                <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {product.description || product.ar_description}
                                </p>
                            </div>
                        )}

                        {/* Specifications & SKU Grid */}
                        <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
                            <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-4">Product Overview</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                {currentSkuObj?.code && (
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <span className="text-gray-400 block font-bold text-[10px] uppercase mb-0.5">SKU Code</span>
                                        <span className="font-black text-gray-800">{currentSkuObj.code}</span>
                                    </div>
                                )}
                                {product.brand?.name && (
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <span className="text-gray-400 block font-bold text-[10px] uppercase mb-0.5">Brand</span>
                                        <span className="font-black text-gray-800">{product.brand.name}</span>
                                    </div>
                                )}
                                {product.category?.name && (
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <span className="text-gray-400 block font-bold text-[10px] uppercase mb-0.5">Category</span>
                                        <span className="font-black text-gray-800">{product.category.name}</span>
                                    </div>
                                )}
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-400 block font-bold text-[10px] uppercase mb-0.5">Availability</span>
                                    <span className={`font-black ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {inStock ? `${currentStock} Available` : 'Out of Stock'}
                                    </span>
                                </div>
                                {(product.created_at || product.createdAt) && (
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <span className="text-gray-400 block font-bold text-[10px] uppercase mb-0.5">Release Date</span>
                                        <span className="font-black text-gray-800">
                                            {new Date(product.created_at || product.createdAt!).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quantity & Controls */}
                        <div className={`space-y-4 ${!inStock ? 'opacity-40 pointer-events-none' : ''}`}>
                            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-[28px] p-5 shadow-sm">
                                <div>
                                    <span className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1">Quantity</span>
                                    <span className="text-xs text-gray-400 font-bold">Total: {totalPrice} EGP</span>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-1.5 shadow-inner">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-primary hover:text-secondary hover:shadow-md transition-all active:scale-90"
                                    >
                                        <Minus size={16} strokeWidth={2.5} />
                                    </button>
                                    <span className="w-8 text-center font-black text-lg text-primary">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
                                        className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-primary hover:text-secondary hover:shadow-md transition-all active:scale-90"
                                    >
                                        <Plus size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>

                            {/* CTA Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!inStock || isAddingToCart || isBuyingNow}
                                    className={`flex-1 py-4 px-6 rounded-[1.25rem] font-black text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] border-2 ${inStock
                                        ? 'bg-white text-primary border-primary hover:bg-primary hover:text-white shadow-lg shadow-primary/10 hover:shadow-primary/25'
                                        : 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
                                        }`}
                                >
                                    {isAddingToCart
                                        ? <Loader2 size={20} className="animate-spin" />
                                        : <ShoppingCart size={20} strokeWidth={2.5} />
                                    }
                                    {isAddingToCart ? 'Adding...' : (!inStock ? 'OUT OF STOCK' : 'Add to Cart')}
                                </button>

                                <button
                                    onClick={handleBuyNow}
                                    disabled={!inStock || isAddingToCart || isBuyingNow}
                                    className={`flex-1 py-4 px-6 rounded-[1.25rem] font-black text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] border-2 ${inStock
                                        ? 'bg-secondary text-white border-secondary hover:bg-primary hover:border-primary shadow-xl shadow-secondary/20 hover:shadow-primary/25'
                                        : 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
                                        }`}
                                >
                                    {isBuyingNow
                                        ? <Loader2 size={20} className="animate-spin" />
                                        : <Zap size={20} strokeWidth={2.5} />
                                    }
                                    {isBuyingNow ? 'Processing...' : (!inStock ? 'SOLD OUT' : 'Buy Now')}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
