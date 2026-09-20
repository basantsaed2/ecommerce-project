"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Category } from '@/types/api';
import { Loader2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useStoreSettings } from '@/hooks/useStoreSettings';

interface ModernCategoriesProps {
    searchQuery?: string;
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function ModernCategories({
    searchQuery = "",
    title,
    subtitle
}: ModernCategoriesProps) {
    const { logoUrl } = useStoreSettings();
    const { data, isLoading, error } = useGet<ApiResponse<Category>>(['categories'], '/category');

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-secondary" size={32} />
            </div>
        );
    }
    if (error) return null;

    const allCategories = (data?.data?.data || []).filter((category) => category.is_featured === true);
    const categories = allCategories.filter(c => 
        !searchQuery || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.ar_name && c.ar_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (categories.length === 0) return null;

    return (
        <section className="w-full py-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <span className="text-xs font-black uppercase tracking-widest text-secondary block mb-1">
                        {subtitle || "Categories Overview"}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                        {title || "Featured Categories"}
                    </h2>
                </div>
                <Link 
                    href="/categories" 
                    className="text-sm font-bold text-secondary hover:underline flex items-center gap-1"
                >
                    Explore all categories <ArrowUpRight size={16} />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categories.slice(0, 8).map((cat) => (
                    <Link
                        key={cat._id}
                        href={`/categories?id=${cat._id}`}
                        className="group relative h-48 sm:h-56 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
                    >
                        <img
                            src={cat.image || logoUrl || undefined}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                            <h3 className="text-base sm:text-lg font-black tracking-tight group-hover:text-secondary transition-colors">
                                {cat.name || cat.ar_name}
                            </h3>
                            <div className="flex items-center justify-between text-xs text-gray-300 mt-1">
                                <span>{cat.product_quantity ? `${cat.product_quantity} Products` : 'Explore'}</span>
                                <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-secondary transition-colors">
                                    <ArrowUpRight size={14} />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
