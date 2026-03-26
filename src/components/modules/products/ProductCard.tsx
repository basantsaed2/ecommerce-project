"use client";
import React, { useState } from 'react';
import { Product } from '@/types/api';
import { ShoppingCart, Heart } from 'lucide-react';
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

    // Wishlist
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
        toggleWishlist(
            { productId: product._id },
            {
                onSuccess: () =>
                    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist'),
            }
        );
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (product.quantity <= 0) {
            toast.error('This product is currently sold out');
            return;
        }

        dispatch(addItemToCart({
            productId: product._id,
            quantity: 1
        }) as any);

        toast.success(`Processing...`);
    };

    return (
        <>
            <div
                onClick={() => setIsDialogOpen(true)}
                className="group flex flex-col bg-white rounded-[32px] border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-500 overflow-hidden relative cursor-pointer"
            >
                {/* Wishlist Button — only shown when logged in */}
                {token && (
                    <div
                        className="absolute top-4 right-4 z-20"
                        onClick={handleWishlistToggle}
                    >
                        <button
                            disabled={isTogglingWishlist}
                            className={`bg-white/80 backdrop-blur-md p-2.5 rounded-2xl shadow-sm transition-all active:scale-90 ${
                                isInWishlist
                                    ? 'text-red-500'
                                    : 'text-gray-400 hover:text-red-500'
                            } hover:bg-white disabled:opacity-50`}
                        >
                            <Heart
                                size={18}
                                className={isInWishlist ? 'fill-red-500' : ''}
                            />
                        </button>
                    </div>
                )}

                {/* Hot Badge */}
                {product.is_featured && (
                    <div className="absolute top-4 left-4 z-20">
                        <div className="bg-secondary text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.1em] shadow-lg shadow-secondary/20">
                            Hot
                        </div>
                    </div>
                )}

                {/* Image Section with Soft Background */}
                <div className="relative h-56 sm:h-64 bg-gray-50/30 flex items-center justify-center overflow-hidden p-6">
                    {/* Decorative Background Blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-secondary/5 rounded-full blur-[40px] group-hover:bg-secondary/10 transition-colors duration-700" />

                    <img
                        src={product.image}
                        alt={product.name || product.ar_name}
                        className={`max-w-full max-h-full object-contain relative z-10 transition-transform duration-700 ease-out ${product.quantity > 0 ? 'group-hover:scale-110 group-hover:rotate-2' : ''}`}
                    />

                    {/* Sold Out Overlay on Image */}
                    {product.quantity <= 0 && (
                        <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-red-500 text-white font-black px-6 py-2 rounded-2xl transform -rotate-12 absolute shadow-xl shadow-red-500/20 text-lg tracking-widest uppercase border-4 border-white">
                                Sold Out
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-1 bg-white">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-4 h-[2px] bg-secondary rounded-full" />
                            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">
                                Premium Selection
                            </p>
                        </div>
                        <h3 className="font-black text-primary text-sm line-clamp-2 leading-snug group-hover:text-secondary transition-colors duration-300" title={product.name || product.ar_name}>
                            {product.name || product.ar_name}
                        </h3>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Price</p>
                            <div className="flex items-baseline gap-2">
                                <span className="font-black text-xl text-primary tracking-tighter">
                                    {product.price?.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-black text-primary/40 uppercase">EGP</span>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.quantity <= 0}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                product.quantity > 0
                                    ? 'bg-primary text-white hover:bg-secondary hover:shadow-xl hover:shadow-secondary/40 active:scale-90 group/btn'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <ShoppingCart size={20} className={product.quantity > 0 ? "group-hover/btn:-translate-y-0.5 transition-transform" : ""} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Render the Details Dialog conditionally */}
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
