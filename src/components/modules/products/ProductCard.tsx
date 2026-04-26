"use client";
import React, { useState } from 'react';
import { Product } from '@/types/api';
import { ShoppingCart, Heart, Eye, Zap } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, syncCart } from '@/store/slices/cartSlice';
import { RootState, AppDispatch } from '@/store/store';
import ProductDialog from './ProductDialog';
import { toast } from 'sonner';
import { useGetWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const token = useSelector((state: RootState) => state.auth.token);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Group variations and options for summary
    const variationsMap: Record<string, string[]> = {};
    if (product.prices) {
        product.prices.forEach(p => {
            p.variations.forEach(v => {
                const vName = v.name;
                if (!variationsMap[vName]) {
                    variationsMap[vName] = [];
                }
                v.options.forEach(opt => {
                    if (!variationsMap[vName].includes(opt.name)) {
                        variationsMap[vName].push(opt.name);
                    }
                });
            });
        });
    }
    const variationNames = Object.keys(variationsMap);

    const { data: wishlistData } = useGetWishlist(!!token);
    const { mutate: toggleWishlist, isPending: isTogglingWishlist } = useToggleWishlist();

    const isInWishlist = wishlistData?.data?.data?.some(
        (item) => item._id === product._id
    ) ?? false;

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

        // If has variations, open dialog instead of direct add
        if (variationNames.length > 0) {
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

        // If has variations, open dialog instead of direct add
        if (variationNames.length > 0) {
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
                className="group relative flex flex-col bg-white rounded-[24px] border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)] overflow-hidden cursor-pointer"
            >
                {/* Badges & Actions Overlay */}
                <div className="absolute top-3 inset-x-3 z-20 flex justify-between items-start pointer-events-none">
                    <div className="flex flex-col gap-2">
                        {product.is_featured && (
                            <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                                Hot
                            </span>
                        )}
                        {product.quantity > 0 && product.quantity < 5 && (
                            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase border border-red-100">
                                Low Stock
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 pointer-events-auto">
                        <button
                            onClick={handleWishlistToggle}
                            disabled={isTogglingWishlist}
                            aria-label="Add to wishlist"
                            className={`p-2.5 rounded-xl transition-all active:scale-90 shadow-sm border ${isInWishlist
                                    ? 'bg-red-50 border-red-100 text-red-500'
                                    : 'bg-white border-gray-100 text-gray-400 hover:text-red-500'
                                }`}
                        >
                            <Heart size={18} className={isInWishlist ? 'fill-current animate-pulse' : ''} />
                        </button>
                    </div>
                </div>

                {/* Image Container */}
                <div className="relative aspect-square bg-[#F9FAFB] overflow-hidden flex items-center justify-center p-8">
                    {/* Hover Quick View Icon */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDialogOpen(true);
                            }}
                            className="bg-white/90 backdrop-blur-sm p-3 rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-white hover:scale-110 active:scale-95 shadow-md"
                        >
                            <Eye size={20} className="text-gray-700" />
                        </button>
                    </div>

                    <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className={`max-w-full max-h-full object-contain transition-transform duration-700 ease-in-out ${product.quantity > 0
                                ? 'group-hover:scale-110'
                                : 'grayscale opacity-50'
                            }`}
                    />

                    {product.quantity <= 0 && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-20">
                            <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-3 md:p-5 flex flex-col flex-1">
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-1 mb-1.5">
                            {product.category ? (
                                <span className="text-[9px] font-bold text-secondary bg-secondary/5 px-2 py-0.5 rounded-md uppercase tracking-wider border border-secondary/10">
                                    {product.category.name}
                                </span>
                            ) : product.categoryId && product.categoryId.length > 0 ? (
                                <>
                                    {product.categoryId.slice(0, 2).map((cat) => (
                                        <span key={cat._id} className="text-[9px] font-bold text-secondary bg-secondary/5 px-2 py-0.5 rounded-md uppercase tracking-wider border border-secondary/10">
                                            {cat.name}
                                        </span>
                                    ))}
                                    {product.categoryId.length > 2 && (
                                        <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md uppercase tracking-wider border border-gray-100">
                                            +{product.categoryId.length - 2} More
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.15em] opacity-70">
                                    Collection
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1 group-hover:text-secondary transition-colors">
                            {product.name}
                        </h3>

                        {/* Variation Summary */}
                        {variationNames.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                                {variationNames.map(vName => (
                                    <span key={vName} className="text-[8px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                        {variationsMap[vName].length} {vName}s
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price row */}
                    <div className="mt-auto">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <span className="block text-[10px] text-gray-400 font-bold uppercase mb-0.5">Price</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-lg text-gray-900">
                                        {(product.main_price || product.price)?.toLocaleString()}
                                    </span>
                                    <span className="text-[11px] font-bold text-gray-400">EGP</span>
                                </div>
                            </div>

                            {/* Add to Cart icon button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={product.quantity <= 0}
                                aria-label="Add to cart"
                                className={`relative overflow-hidden w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${product.quantity > 0
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
                            className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] ${product.quantity > 0
                                    ? 'bg-secondary text-white hover:bg-primary shadow-md shadow-secondary/20 hover:shadow-primary/20'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <Zap size={13} strokeWidth={2.5} />
                            {variationNames.length > 0 ? 'Select Options' : 'Buy Now'}
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
