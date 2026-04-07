"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Category } from '@/types/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CategoriesSectionProps {
    searchQuery?: string;
}

export default function CategoriesSection({ searchQuery = "" }: CategoriesSectionProps) {
    const { data, isLoading, error } = useGet<ApiResponse<Category>>(['categories'], '/category');

    if (isLoading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-secondary" size={32} />
        </div>
    );
    
    if (error) return null;

    const allCategories = data?.data?.data || [];

    // Client-side filtering
    const categories = allCategories.filter(c => 
        !searchQuery || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.ar_name && c.ar_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (allCategories.length === 0) return null;

    return (
        <section className="w-full px-4 md:px-6 py-6 relative">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                <div className="text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight mb-2">
                        Browse by <span className="text-secondary underline decoration-secondary/20 underline-offset-8">Category</span>
                    </h2>
                    <p className="text-gray-400 font-medium text-sm">Discover our handpicked collections for you</p>
                </div>
                <Link href="/categories" className="px-6 py-3 bg-gray-50 text-gray-900 rounded-2xl text-sm font-bold hover:bg-secondary hover:text-white transition-all active:scale-95 shadow-sm">
                    View All Categories
                </Link>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-6 px-2 snap-x scrollbar-hide">
                {categories.map((category) => (
                    <Link 
                        key={category._id} 
                        href={`/categories#${category._id}`} 
                        className="snap-start flex flex-col items-center group min-w-[140px] md:min-w-[160px]"
                    >
                        <div className="relative w-28 h-28 md:w-32 md:h-32 mb-4">
                            {/* Decorative background circle */}
                            <div className="absolute inset-0 bg-secondary/5 rounded-[2rem] group-hover:bg-secondary/10 group-hover:rotate-12 transition-all duration-500" />
                            
                            <div className="absolute inset-2 bg-white rounded-[1.75rem] shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center group-hover:border-secondary transition-all duration-500 overflow-hidden group-hover:scale-105 group-hover:-translate-y-2">
                                <img
                                    src={category.image}
                                    alt={category.name || category.ar_name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        </div>
                        
                        <span className="text-sm font-black text-primary text-center group-hover:text-secondary uppercase tracking-wider transition-colors">
                            {category.name || category.ar_name}
                        </span>
                        
                        <span className="text-[10px] font-bold text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                            Explore Collection &rarr;
                        </span>
                    </Link>
                ))}
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}
