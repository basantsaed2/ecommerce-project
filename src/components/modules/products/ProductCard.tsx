"use client";
import React, { useState } from 'react';
import { Product } from '@/types/api';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { addItemToCart } from '@/store/slices/cartSlice';
import { RootState } from '@/store/store';
import ProductDialog from './ProductDialog';
import { toast } from 'sonner';
import { useGetWishlist, useToggleWishlist } from '@/hooks/useWishlist';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.auth.token);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (product.quantity <= 0) return;

        dispatch(addItemToCart({ productId: product._id, quantity: 1 }) as any);
        toast.success(`${product.name} added to cart`);
    };

    return (
        <>
            <div
                onClick={() => setIsDialogOpen(true)}
                className="group relative flex flex-col bg-white rounded-[24px] border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden cursor-pointer"
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
                            className={`p-2.5 rounded-xl transition-all active:scale-90 shadow-sm border ${
                                isInWishlist 
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
                        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <Eye size={20} className="text-gray-700" />
                        </div>
                    </div>

                    <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className={`max-w-full max-h-full object-contain transition-transform duration-700 ease-in-out ${
                            product.quantity > 0 
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
                <div className="p-2 md:p-5 flex flex-col flex-1">
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
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-secondary transition-colors">
                            {product.name}
                        </h3>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                        <div>
                            <span className="block text-[10px] text-gray-400 font-bold uppercase mb-0.5">Price</span>
                            <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-lg text-gray-900">
                                    {product.price?.toLocaleString()}
                                </span>
                                <span className="text-[11px] font-bold text-gray-400">EGP</span>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.quantity <= 0}
                            aria-label="Add to cart"
                            className={`relative overflow-hidden w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                product.quantity > 0
                                    ? 'bg-gray-900 text-white hover:bg-secondary hover:shadow-lg active:scale-95'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <ShoppingCart size={18} />
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