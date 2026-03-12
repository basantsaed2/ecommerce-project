"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Product } from '@/types/api';
import { Loader2, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';

export default function ProductsSection() {
    const { data, isLoading, error } = useGet<ApiResponse<Product>>(['products'], '/api/store/product');

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-secondary" size={32} /></div>;
    if (error) return null;

    const products = data?.data?.data || [];

    if (products.length === 0) return null;

    return (
        <section className="w-full px-2 md:px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-primary tracking-tight">Trending <span className="text-secondary">Products</span></h2>
                <Link href="/products" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">See All &rarr;</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {products.map((product) => (
                    <div key={product._id} className="group flex flex-col bg-white rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden relative">
                        {/* Tags */}
                        {product.is_featured && (
                            <div className="absolute top-4 left-4 z-10 bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                                Hot
                            </div>
                        )}

                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors">
                                <Heart size={18} />
                            </button>
                        </div>

                        {/* Image */}
                        <Link href={`/product/${product._id}`} className="relative h-48 sm:h-56 bg-white p-4 flex items-center justify-center overflow-hidden border-b border-gray-50">
                            <img
                                src={product.image}
                                alt={product.name || product.ar_name}
                                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80';
                                }}
                            />
                        </Link>

                        {/* Content */}
                        <div className="p-4 md:p-5 flex flex-col flex-1 bg-gray-50/50">
                            <Link href={`/product/${product._id}`} className="flex-1">
                                <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-secondary transition-colors" title={product.name || product.ar_name}>
                                    {product.name || product.ar_name}
                                </h3>
                                {/* Small brand or category label could go here */}
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-2 line-clamp-1">
                                    Product
                                </p>
                            </Link>

                            <div className="mt-4 flex items-end justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1">Price</p>
                                    <p className="font-black text-lg text-primary">${product.price?.toLocaleString()} <span className="text-xs font-bold text-gray-400 line-through ml-1">${(product.price * 1.2).toLocaleString()}</span></p>
                                </div>
                                <button className="bg-primary text-white p-2.5 md:p-3 rounded-2xl hover:bg-secondary hover:shadow-lg hover:shadow-secondary/30 transition-all active:scale-95">
                                    <ShoppingCart size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
