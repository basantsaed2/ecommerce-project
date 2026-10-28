"use client";

import React, { useState } from 'react';
import { Product } from '@/types/api';
import { ShoppingCart, Heart, Eye, Zap, Tag, Sparkles, Box } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, syncCart } from '@/store/slices/cartSlice';
import { RootState, AppDispatch } from '@/store/store';
import ProductDialog from './ProductDialog';
import { toast } from 'sonner';
import { useGetWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { useRouter } from 'next/navigation';
import { getProductPriceInfo } from '@/utils/productUtils';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductCardProps {
    product: Product;
    badge?: string;
}

export default function ProductCard({ product, badge }: ProductCardProps) {
    const { logoUrl } = useStoreSettings();
    const { t, getLocalized, formatPrice } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const token = useSelector((state: RootState) => state.auth.token);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const hasVariations = product.variations && product.variations.length > 0;

    const { data: wishlistData } = useGetWishlist(!!token);
    const { mutate: toggleWishlist, isPending: isTogglingWishlist } = useToggleWishlist();

    const isInWishlist = (
        wishlistData?.data?.data?.some((item) => item._id === product._id) ??
        product.is_favorite ??
        false
    );

    const priceInfo = getProductPriceInfo(product);

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!token) {
            toast.error(t.product.wishlistLogin);
            return;
        }
        toggleWishlist({ productId: product._id });
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (product.quantity <= 0) return;

        if (hasVariations) {
            setIsDialogOpen(true);
            return;
        }

        dispatch(addItem({ product, quantity: 1 }));
        await dispatch(syncCart());
        toast.success(`${getLocalized(product)} ${t.product.addedToCartNamed}`);
        router.push('/cart');
    };

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (product.quantity <= 0) return;

        if (hasVariations) {
            setIsDialogOpen(true);
            return;
        }

        dispatch(addItem({ product, quantity: 1 }));
        await dispatch(syncCart());
        router.push('/cart');
    };

    const handleCardClick = () => {
        router.push(`/product/${product._id}`);
    };

    return (
        <>
            <div
                onClick={handleCardClick}
                className="group relative flex flex-col bg-white rounded-[24px] border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1 overflow-hidden cursor-pointer"
            >
                {/* Badges & Actions Overlay */}
                <div className="absolute top-3 inset-x-3 z-20 flex justify-between items-start pointer-events-none">
                    <div className="flex flex-col gap-1.5 items-start">
                        {badge && (
                            <span className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                                {badge}
                            </span>
                        )}

                        {/* Discount Badge */}
                        {priceInfo.hasDiscount && (
                            <span className="bg-gradient-to-r from-red-600 to-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                                <Tag size={10} className="fill-current" />
                                {priceInfo.discountLabel ? `${priceInfo.discountLabel} ` : ''}
                                -{priceInfo.discountPercent}%
                            </span>
                        )}

                        {/* Featured Badge */}
                        {product.is_featured && (
                            <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="" aria-hidden="true" className="h-3 w-3 rounded-sm object-contain" />
                                ) : (
                                    <Sparkles size={10} className="fill-current" />
                                )}
                                {t.product.featuredLabel}
                            </span>
                        )}

                        {/* Low Stock Badge */}
                        {product.quantity > 0 && product.quantity < 5 && (
                            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-red-100 shadow-sm">
                                {t.product.onlyLeft} {product.quantity}
                            </span>
                        )}
                    </div>

                    {/* Wishlist Action Button */}
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        <button
                            onClick={handleWishlistToggle}
                            disabled={isTogglingWishlist}
                            aria-label={t.nav.wishlist}
                            className={`p-2.5 rounded-xl transition-all active:scale-90 shadow-sm border ${
                                isInWishlist
                                    ? 'bg-red-50 border-red-100 text-red-500'
                                    : 'bg-white/90 backdrop-blur-sm border-gray-100 text-gray-400 hover:text-red-500 hover:bg-white'
                            }`}
                        >
                            <Heart size={18} className={isInWishlist ? 'fill-current animate-pulse' : ''} />
                        </button>
                    </div>
                </div>

                {/* Image Container */}
                <div className="relative aspect-square bg-[#F8FAFC] overflow-hidden flex items-center justify-center p-6">
                    <div className="absolute inset-0 z-10 flex items-end justify-center bg-black/35 p-3 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                        <div className="flex w-full flex-wrap items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={product.quantity <= 0}
                                aria-label={t.product.addToCart}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-[var(--color-on-primary)] shadow-lg transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <ShoppingCart size={15} />
                                {t.product.addToCart}
                            </button>
                            <button
                                type="button"
                                onClick={handleBuyNow}
                                disabled={product.quantity <= 0}
                                aria-label={t.product.buyNow}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-secondary px-3 py-2 text-xs font-bold text-[var(--color-on-secondary)] shadow-lg transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Zap size={14} />
                                {t.product.buyNow}
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDialogOpen(true);
                                }}
                                aria-label={t.product.quickView}
                                title={t.product.quickView}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-900 shadow-lg transition hover:bg-gray-100"
                            >
                                <Eye size={16} />
                            </button>
                        </div>
                    </div>

                    <img
                        src={product.image || product.gallery_product?.[0] || logoUrl || undefined}
                        alt={getLocalized(product) || t.nav.product}
                        loading="lazy"
                        className={`max-w-full max-h-full object-contain transition-transform duration-700 ease-out group-hover:scale-110 ${
                            product.quantity > 0 ? 'group-hover:scale-105' : 'grayscale opacity-40'
                        }`}
                    />

                    {product.quantity <= 0 && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                            <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg border border-gray-700">
                                {t.product.outOfStock}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Container */}
                <div className="p-4 md:p-5 flex flex-col flex-1">
                    {/* Brand & Category badges */}
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        {product.brand?.name && (
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-md">
                                {getLocalized(product.brand)}
                            </span>
                        )}
                        {product.category?.name ? (
                            <span className="text-[9px] font-bold text-gray-800 bg-secondary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {getLocalized(product.category)}
                            </span>
                        ) : product.categoryId && product.categoryId.length > 0 ? (
                            <span className="text-[9px] font-bold text-gray-800 bg-secondary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {getLocalized(product.categoryId[0])}
                            </span>
                        ) : null}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors mb-1">
                        {getLocalized(product)}
                    </h3>

                    {/* Description preview */}
                    {product.description && (
                        <p className="text-gray-400 text-xs line-clamp-1 mb-2">
                            {getLocalized(product, 'description')}
                        </p>
                    )}

                    {/* Variation Info Badges */}
                    {hasVariations && (
                        <div className="mt-1 mb-3 flex flex-wrap gap-1">
                            {product.variations!.map((v) => (
                                <span key={v._id} className="text-[9px] font-semibold text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 flex items-center gap-1">
                                    <Box size={10} className="text-gray-400" />
                                    {getLocalized(v)}: {v.options?.length || 0}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Price section */}
                    <div className="mt-auto pt-3 border-t border-gray-50">
                        <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{t.product.price}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-black text-xl text-gray-900">
                                {formatPrice(priceInfo.finalPrice)}
                            </span>

                            {priceInfo.hasDiscount && (
                                <span className="text-xs font-bold text-gray-500 line-through">
                                    {priceInfo.mainPrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isDialogOpen && (
                <ProductDialog
                    productId={product._id}
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                />
            )}
        </>
    );
}
