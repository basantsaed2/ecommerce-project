"use client";
import React, { useState } from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Product } from '@/types/api';
import { Loader2, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '../products/ProductCard';

interface ProductsSectionProps {
    searchQuery?: string;
}

export default function ProductsSection({ searchQuery = "" }: ProductsSectionProps) {
    const { data, isLoading, error } = useGet<ApiResponse<Product>>(
        ['products'],
        '/product'
    );
    const [visibleItems, setVisibleItems] = useState(10);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-secondary" size={48} />
            <p className="text-gray-400 font-bold animate-pulse">Loading amazing products...</p>
        </div>
    );

    if (error) return null;

    const allProducts = data?.data?.data || [];

    // Client-side filtering
    const filteredProducts = allProducts.filter(p =>
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.ar_name && p.ar_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const products = filteredProducts.slice(0, visibleItems);
    const hasMore = visibleItems < filteredProducts.length;

    const handleLoadMore = () => {
        setVisibleItems(prev => prev + 10);
    };

    if (allProducts.length === 0) return null;

    return (
        <section className="w-full px-2 md:px-6 py-12 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 px-4">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-8 h-[2px] bg-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Our Collection</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter leading-tight">
                        {searchQuery ? 'Search' : 'Trending'} <span className="text-secondary">Products</span>
                    </h2>
                    {searchQuery && (
                        <p className="text-gray-500 mt-4 font-bold flex items-center gap-2">
                            Showing results for <span className="text-secondary italic">"{searchQuery}"</span>
                        </p>
                    )}
                </div>
                <Link href="/categories" className="group flex items-center gap-3 bg-white border border-gray-100 px-8 py-4 rounded-[1.5rem] text-sm font-black text-primary hover:border-secondary hover:text-secondary shadow-sm hover:shadow-xl transition-all active:scale-95 shrink-0">
                    Browse Categories <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 py-32 px-12 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-white shadow-xl rounded-2xl flex items-center justify-center mb-6 text-gray-300">
                        <Search size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-2">No products found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto font-medium">
                        We couldn't find anything matching your search. Try adjusting your filters or search terms.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {hasMore && (
                        <div className="mt-20 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                className="group relative px-12 py-5 bg-primary text-white rounded-[2rem] font-black text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Load More Products
                                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                                </span>
                                <div className="absolute inset-0 bg-secondary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
