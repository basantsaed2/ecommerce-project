"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGet } from '@/hooks/useGet';
import { Product, SingleApiResponse } from '@/types/api';
import {
    Loader2, ArrowLeft, ShoppingCart, Zap, Plus, Minus, Heart,
    Share2, Shield, Truck, RotateCcw, Star, Package
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, syncCart } from '@/store/slices/cartSlice';
import { RootState, AppDispatch } from '@/store/store';
import { toast } from 'sonner';
import { useGetWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import Link from 'next/link';

export default function ProductDetailClient() {
    const { id } = useParams<{ id: string }>();
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

    const isInWishlist = wishlistData?.data?.data?.some(
        (item: any) => item._id === product?._id
    ) ?? false;

    // Group variations and options
    const { variationsMap, variationNames } = useMemo(() => {
        const vMap: Record<string, string[]> = {};
        if (product?.prices) {
            product.prices.forEach(p => {
                p.variations.forEach(v => {
                    const vName = v.name;
                    if (!vMap[vName]) {
                        vMap[vName] = [];
                    }
                    v.options.forEach(opt => {
                        if (!vMap[vName].includes(opt.name)) {
                            vMap[vName].push(opt.name);
                        }
                    });
                });
            });
        }
        return { variationsMap: vMap, variationNames: Object.keys(vMap) };
    }, [product]);

    // Initialize selected options
    useEffect(() => {
        if (product && variationNames.length > 0 && Object.keys(selectedOptions).length === 0) {
            // Find first price object with stock
            const inStockPrice = product.prices?.find(p => p.quantity > 0);
            const initialOptions: Record<string, string> = {};

            if (inStockPrice) {
                inStockPrice.variations.forEach(v => {
                    initialOptions[v.name] = v.options[0].name;
                });
            } else {
                variationNames.forEach(name => {
                    initialOptions[name] = variationsMap[name][0];
                });
            }
            setSelectedOptions(initialOptions);
        }
    }, [product, variationNames, variationsMap, selectedOptions]);

    // Find the current selected price object
    const currentPriceObj = useMemo(() => {
        if (!product?.prices) return null;
        return product.prices.find(p => {
            return variationNames.every(vName => {
                return p.variations.some(v => v.name === vName && v.options.some(opt => opt.name === selectedOptions[vName]));
            });
        });
    }, [product, variationNames, selectedOptions]);

    const displayPrice = currentPriceObj ? currentPriceObj.price : (product?.main_price || product?.price || 0);
    const displayPriceAfterDiscount = currentPriceObj?.price_after_discount;
    const isOutOfStock = currentPriceObj ? currentPriceObj.quantity <= 0 : (product?.quantity || 0) <= 0;

    // Check if an option is available given current selections of other variations
    const isOptionAvailable = (vName: string, oName: string) => {
        if (!product?.prices) return true;
        return product.prices.some(p => {
            if (p.quantity <= 0) return false;
            const matchesOption = p.variations.some(v => v.name === vName && v.options.some(opt => opt.name === oName));
            if (!matchesOption) return false;
            return variationNames.every(otherVName => {
                if (otherVName === vName) return true;
                return p.variations.some(v => v.name === otherVName && v.options.some(opt => opt.name === selectedOptions[otherVName]));
            });
        });
    };

    const handleWishlistToggle = () => {
        if (!token) { toast.error('Please login to save to wishlist'); return; }
        toggleWishlist({ productId: product!._id });
    };

    const handleAddToCart = async () => {
        if (!product || isOutOfStock) return;
        setIsAddingToCart(true);
        dispatch(addItem({
            product: product,
            variant: currentPriceObj || undefined,
            quantity: quantity
        }));
        await dispatch(syncCart());
        setIsAddingToCart(false);
    };

    const handleBuyNow = async () => {
        if (!product || isOutOfStock) return;
        setIsBuyingNow(true);
        dispatch(addItem({
            product: product,
            variant: currentPriceObj || undefined,
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Loader2 className="animate-spin text-primary" size={36} />
                    </div>
                    <p className="text-gray-500 font-bold">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
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

    const allImages = product.gallery_product && product.gallery_product.length > 0
        ? [product.image, ...product.gallery_product]
        : [product.image];

    const displayedImage = selectedImage || product.image;
    const inStock = product.quantity > 0;
    const totalPrice = (displayPrice * quantity).toLocaleString();

    return (
        <div className="w-full max-h-screen bg-gray-50/30">
            {/* Breadcrumb */}
            <div className="w-full px-4 md:px-12 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
                    <Link href="/" className="hover:text-primary font-bold transition-colors">Home</Link>
                    <span>/</span>
                    {product.category && (
                        <>
                            <span className="font-bold">{product.category.name}</span>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-primary font-bold truncate max-w-[200px]">{product.name}</span>
                </div>
            </div>

            <div className="w-full px-4 md:px-12 pb-16">
                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

                    {/* ─── Left: Image Panel ─── */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm aspect-square flex items-center justify-center p-10 group">
                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                {product.is_featured && (
                                    <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                                        🔥 Hot
                                    </span>
                                )}
                                {inStock && product.quantity < 5 && (
                                    <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase border border-red-100">
                                        Low Stock
                                    </span>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                                <button
                                    onClick={handleWishlistToggle}
                                    disabled={isTogglingWishlist}
                                    className={`p-3 rounded-xl shadow-sm border transition-all active:scale-90 ${isInWishlist
                                        ? 'bg-red-50 border-red-100 text-red-500'
                                        : 'bg-white border-gray-100 text-gray-400 hover:text-red-500'
                                        }`}
                                    aria-label="Wishlist"
                                >
                                    <Heart size={20} className={isInWishlist ? 'fill-current' : ''} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-3 rounded-xl shadow-sm border bg-white border-gray-100 text-gray-400 hover:text-primary transition-all active:scale-90"
                                    aria-label="Share"
                                >
                                    <Share2 size={20} />
                                </button>
                            </div>

                            <img
                                src={displayedImage}
                                alt={product.name}
                                className={`max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-105 ${!inStock ? 'grayscale opacity-60' : ''}`}
                            />

                            {!inStock && (
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                                    <span className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest rotate-[-12deg] shadow-xl border-2 border-white">
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
                                                ? 'border-primary shadow-lg scale-105'
                                                : 'border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        <img src={img} alt={`view ${idx}`} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── Right: Info Panel ─── */}
                    <div className="flex flex-col">
                        {/* Category tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {product.category ? (
                                <span className="text-[10px] font-black text-secondary bg-secondary/5 px-3 py-1 rounded-lg uppercase tracking-wider border border-secondary/10">
                                    {product.category.name}
                                </span>
                            ) : product.categoryId?.slice(0, 2).map((cat: any) => (
                                <span key={cat._id} className="text-[10px] font-black text-secondary bg-secondary/5 px-3 py-1 rounded-lg uppercase tracking-wider border border-secondary/10">
                                    {cat.name}
                                </span>
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-black text-primary leading-tight mb-4">
                            {product.name || product.ar_name}
                        </h1>

                        {/* Rating row */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={14} className={s <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'} />
                                ))}
                            </div>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">4.0 · Verified</span>
                        </div>

                        {/* Price box */}
                        <div className="bg-white border border-gray-100 rounded-[24px] p-6 mb-6 shadow-sm">
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-5xl font-black text-secondary tracking-tight">
                                    {(displayPriceAfterDiscount || displayPrice)?.toLocaleString()}
                                </span>
                                <span className="text-2xl font-bold text-gray-400 mb-1">EGP</span>
                                {(displayPriceAfterDiscount && displayPrice) && (
                                    <span className="text-xl font-bold text-gray-300 line-through mb-1">
                                        {displayPrice.toLocaleString()} EGP
                                    </span>
                                )}
                                {(!displayPriceAfterDiscount && product.main_price && product.main_price > displayPrice) && (
                                    <span className="text-xl font-bold text-gray-300 line-through mb-1">
                                        {product.main_price.toLocaleString()} EGP
                                    </span>
                                )}
                            </div>
                            {displayPriceAfterDiscount && (
                                <span className="inline-block bg-green-50 text-green-600 text-xs font-black px-3 py-1 rounded-lg border border-green-100">
                                    Save {Math.round((1 - (displayPriceAfterDiscount / displayPrice)) * 100)}%
                                </span>
                            )}
                        </div>

                        {/* Variations Section */}
                        {variationNames.length > 0 && (
                            <div className="space-y-6 mb-8">
                                {variationNames.map(vName => (
                                    <div key={vName}>
                                        <label className="text-sm font-black text-gray-700 block mb-3 uppercase tracking-wider">
                                            {vName}
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {variationsMap[vName].map(oName => {
                                                const isAvailable = isOptionAvailable(vName, oName);
                                                return (
                                                    <button
                                                        key={oName}
                                                        disabled={!isAvailable}
                                                        onClick={() => setSelectedOptions(prev => ({ ...prev, [vName]: oName }))}
                                                        className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all border-2 ${selectedOptions[vName] === oName
                                                            ? 'bg-primary border-primary text-white shadow-md'
                                                            : !isAvailable
                                                                ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50 line-through'
                                                                : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        {oName}
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
                            <div className="mb-6">
                                <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-3">Description</h2>
                                <p className="text-gray-500 leading-relaxed text-base">
                                    {product.description || product.ar_description}
                                </p>
                            </div>
                        )}

                        {/* Stock indicator */}
                        <div className={`flex items-center gap-2 mb-6 px-4 py-3 rounded-xl border ${inStock ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-400'} animate-pulse`} />
                            <span className={`text-sm font-black ${inStock ? 'text-green-700' : 'text-red-600'}`}>
                                {inStock
                                    ? product.quantity <= 10
                                        ? `Only ${product.quantity} left in stock!`
                                        : 'In Stock — Available'
                                    : 'Out of Stock'}
                            </span>
                        </div>

                        {/* Quantity selector */}
                        <div className={`mb-8 ${!inStock ? 'opacity-40 pointer-events-none' : ''}`}>
                            <label className="text-sm font-black text-gray-700 block mb-3 uppercase tracking-wider">Quantity</label>
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-2 shadow-inner w-fit">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-11 h-11 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-primary hover:text-secondary hover:shadow-md transition-all active:scale-90"
                                    >
                                        <Minus size={16} strokeWidth={2.5} />
                                    </button>
                                    <span className="w-10 text-center font-black text-xl text-primary">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                                        className="w-11 h-11 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-primary hover:text-secondary hover:shadow-md transition-all active:scale-90"
                                    >
                                        <Plus size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total</span>
                                    <span className="text-primary font-black text-xl">{totalPrice} EGP</span>
                                </div>
                            </div>
                        </div>

                        {/* ─── CTA Buttons ─── */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                            {/* Add to Cart */}
                            <button
                                id="add-to-cart-btn"
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
                                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                            </button>

                            {/* Buy Now */}
                            <button
                                id="buy-now-btn"
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
                                {isBuyingNow ? 'Processing...' : 'Buy Now'}
                            </button>
                        </div>

                        {!inStock && (
                            <p className="text-center text-xs font-bold text-red-400 mt-4 uppercase tracking-widest">
                                This product is currently unavailable
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
