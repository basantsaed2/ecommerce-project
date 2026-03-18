"use client";
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetWishlist, useClearWishlist } from '@/hooks/useWishlist';
import { Heart, Trash2, HeartOff } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/modules/products/ProductCard';
import { Product } from '@/types/api';

export default function FavouritePage() {
    const token = useSelector((state: RootState) => state.auth.token);

    const { data, isLoading } = useGetWishlist(!!token);
    const { mutate: clearWishlist, isPending: isClearing } = useClearWishlist();

    const wishlistItems = data?.data?.data ?? [];

    if (!token) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
                <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
                    <Heart size={40} className="text-red-400" />
                </div>
                <h1 className="text-2xl font-black text-primary">Login to see your Wishlist</h1>
                <p className="text-gray-400 max-w-xs">Save your favourite products and access them anytime.</p>
                <Link href="/login" className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-xl transition">
                    Login
                </Link>
            </div>
        );
    }

    return (
        <div className="container min-h-screen pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter flex items-center gap-3">
                        <Heart size={28} className="text-red-500 fill-red-500" />
                        My Wishlist
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {wishlistItems.length} saved {wishlistItems.length === 1 ? 'item' : 'items'}
                    </p>
                </div>
                {wishlistItems.length > 0 && (
                    <button
                        onClick={() => clearWishlist()}
                        disabled={isClearing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 font-bold rounded-2xl hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        Clear All
                    </button>
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-3xl bg-gray-100 animate-pulse h-64" />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && wishlistItems.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                        <HeartOff size={40} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-black text-gray-500">Your wishlist is empty</h2>
                    <p className="text-gray-400 max-w-xs text-sm">Browse our products and add your favourites here.</p>
                    <Link href="/" className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-xl transition">
                        Shop Now
                    </Link>
                </div>
            )}

            {/* Items Grid — reuse ProductCard */}
            {!isLoading && wishlistItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                        <ProductCard key={item._id} product={item as unknown as Product} />
                    ))}
                </div>
            )}
        </div>
    );
}
