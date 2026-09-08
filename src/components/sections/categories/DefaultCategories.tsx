"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Category } from '@/types/api';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CategoriesSectionProps {
    searchQuery?: string;
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function DefaultCategories({
    searchQuery = "",
    title,
    subtitle
}: CategoriesSectionProps) {
    const { data, isLoading, error } = useGet<ApiResponse<Category>>(['categories'], '/category');

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-secondary" size={32} />
            </div>
        );
    }
    
    if (error) return null;

    const allCategories = data?.data?.data || [];

    const categories = allCategories.filter(c => 
        !searchQuery || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.ar_name && c.ar_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (allCategories.length === 0) return null;

    return (
        <section className="w-full py-8 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
                <div>
                    <span className="text-xs font-black uppercase tracking-widest text-secondary mb-1 block">
                        {subtitle || "Curated Collections"}
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tracking-tight">
                        {title || "Browse by Category"}
                    </h2>
                </div>
                <Link
                    href="/categories" 
                    className="px-5 py-2.5 bg-white border border-gray-200 text-primary hover:border-secondary hover:text-secondary rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                    View All
                    <ArrowRight size={16} />
                </Link>
            </div>

            <div className="flex overflow-x-auto gap-5 pb-4 px-1 snap-x scrollbar-hide no-scrollbar">
                {categories.map((category) => (
                    <Link 
                        key={category._id} 
                        href={`/categories?id=${category._id}`} 
                        className="snap-start flex flex-col items-center group min-w-[130px] sm:min-w-[150px]"
                    >
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-3">
                            <div className="absolute inset-0 bg-secondary/10 rounded-[2rem] group-hover:bg-secondary/20 group-hover:rotate-6 transition-all duration-300" />
                            
                            <div className="absolute inset-2 bg-white rounded-[1.75rem] shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center group-hover:border-secondary group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                                <img
                                    src={category.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60"}
                                    alt={category.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        <span className="text-sm font-bold text-gray-800 group-hover:text-secondary transition-colors text-center line-clamp-1">
                            {category.name || category.ar_name}
                        </span>
                        {category.product_quantity !== undefined && (
                            <span className="text-[11px] text-gray-400 font-medium">
                                {category.product_quantity} items
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </section>
    );
}
