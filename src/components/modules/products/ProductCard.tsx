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

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
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
            toast.error('Please login to save to wishlist');
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
        dispatch(syncCart());
        toast.success(`${product.name} added to cart`);
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
        router.push(`/product?id=${product._id}`);
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
                                <Sparkles size={10} className="fill-current" />
                                Hot
                            </span>
                        )}

                        {/* Low Stock Badge */}
                        {product.quantity > 0 && product.quantity < 5 && (
                            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-red-100 shadow-sm">
                                Only {product.quantity} left
                            </span>
                        )}
                    </div>

                    {/* Wishlist Action Button */}
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        <button
                            onClick={handleWishlistToggle}
                            disabled={isTogglingWishlist}
                            aria-label="Add to wishlist"
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
                    {/* Hover Quick View Icon */}
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDialogOpen(true);
                            }}
                            className="bg-white text-gray-800 font-bold text-xs px-4 py-2.5 rounded-full flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-black hover:text-white shadow-lg active:scale-95"
                        >
                            <Eye size={16} />
                            Quick View
                        </button>
                    </div>

                    <img
                        src={product.image}
                        alt={product.name || product.ar_name || 'Product'}
                        loading="lazy"
                        className={`max-w-full max-h-full object-contain transition-transform duration-700 ease-out ${
                            product.quantity > 0 ? 'group-hover:scale-105' : 'grayscale opacity-40'
                        }`}
                    />

                    {product.quantity <= 0 && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                            <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg border border-gray-700">
                                Out of Stock
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
                                {product.brand.name}
                            </span>
                        )}
                        {product.category?.name ? (
                            <span className="text-[9px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {product.category.name}
                            </span>
                        ) : product.categoryId && product.categoryId.length > 0 ? (
                            <span className="text-[9px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {product.categoryId[0].name}
                            </span>
                        ) : null}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1 group-hover:text-secondary transition-colors mb-1">
                        {product.name || product.ar_name}
                    </h3>

                    {/* Description preview */}
                    {product.description && (
                        <p className="text-gray-400 text-xs line-clamp-1 mb-2">
                            {product.description}
                        </p>
                    )}

                    {/* Variation Info Badges */}
                    {hasVariations && (
                        <div className="mt-1 mb-3 flex flex-wrap gap-1">
                            {product.variations!.map((v) => (
                                <span key={v._id} className="text-[9px] font-semibold text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 flex items-center gap-1">
                                    <Box size={10} className="text-gray-400" />
                                    {v.name}: {v.options?.length || 0}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Price section */}
                    <div className="mt-auto pt-3 border-t border-gray-50">
                        <div className="flex items-baseline justify-between mb-3">
                            <div>
                                <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Price</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-black text-xl text-gray-900">
                                        {priceInfo.finalPrice.toLocaleString()}
                                    </span>
                                    <span className="text-xs font-bold text-gray-500">EGP</span>

                                    {priceInfo.hasDiscount && (
                                        <span className="text-xs font-bold text-gray-400 line-through">
                                            {priceInfo.mainPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Add to Cart button icon */}
                            <button
                                onClick={handleAddToCart}
                                disabled={product.quantity <= 0}
                                aria-label="Add to cart"
                                className={`relative overflow-hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                    product.quantity > 0
                                        ? 'bg-gray-900 text-white hover:bg-secondary hover:shadow-lg active:scale-95'
                                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                            >
                                <ShoppingCart size={18} />
                            </button>
                        </div>

                        {/* Buy Now button */}
                        <button
                            onClick={handleBuyNow}
                            disabled={product.quantity <= 0}
                            aria-label="Buy now"
                            className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] ${
                                product.quantity > 0
                                    ? 'bg-secondary text-white hover:bg-primary shadow-md shadow-secondary/20 hover:shadow-primary/20'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <Zap size={14} strokeWidth={2.5} />
                            {hasVariations ? 'Select Options' : 'Buy Now'}
                        </button>
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
