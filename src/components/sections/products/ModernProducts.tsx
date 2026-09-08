"use client";
import React, { useState } from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Product } from '@/types/api';
import { Loader2, Flame, Sparkles, Tag, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/modules/products/ProductCard';
import Link from 'next/link';

interface ModernProductsProps {
    searchQuery?: string;
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function ModernProducts({
    searchQuery = "",
    title,
    subtitle
}: ModernProductsProps) {
    const { data, isLoading, error } = useGet<ApiResponse<Product>>(['products'], '/product');
    const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'sale'>('all');

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-secondary" size={40} />
            </div>
        );
    }
    if (error) return null;

    const allProducts = data?.data?.data || [];

    const searchFiltered = allProducts.filter(p =>
        !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.ar_name && p.ar_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filtered = searchFiltered.filter(p => {
        if (activeTab === 'featured') return p.is_featured === true || Boolean(p.discount);
        if (activeTab === 'sale') return Boolean(p.discount || (p.main_price && p.final_price && p.final_price < p.main_price));
        return true;
    });

    return (
        <section className="w-full py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <span className="text-xs font-black uppercase tracking-widest text-secondary block mb-1">
                        {subtitle || "Curated Showcase"}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                        {title || "Featured Collections"}
                    </h2>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                            activeTab === 'all' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'
                        }`}
                    >
                        All ({searchFiltered.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('featured')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                            activeTab === 'featured' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'
                        }`}
                    >
                        <Sparkles size={14} className="text-secondary" />
                        Featured
                    </button>
                    <button
                        onClick={() => setActiveTab('sale')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                            activeTab === 'sale' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'
                        }`}
                    >
                        <Tag size={14} className="text-secondary" />
                        On Sale
                    </button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-3xl">
                    <p className="text-gray-500 font-medium">No products in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filtered.slice(0, 8).map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
