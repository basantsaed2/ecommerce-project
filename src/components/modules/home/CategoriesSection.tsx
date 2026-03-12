"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Category } from '@/types/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesSection() {
    const { data, isLoading, error } = useGet<ApiResponse<Category>>(['categories'], '/api/store/category');

    if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-secondary" /></div>;
    if (error) return null;

    const categories = data?.data?.data || [];

    if (categories.length === 0) return null;

    return (
        <section className="w-full px-2 md:px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-primary tracking-tight">Shop by <span className="text-secondary">Category</span></h2>
                <Link href="/categories" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">View All &rarr;</Link>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {categories.map((category) => (
                    <Link key={category._id} href={`/categories#${category._id}`} className="snap-start flex flex-col items-center gap-3 min-w-[100px] group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-white p-1 shadow-sm border-2 border-transparent group-hover:border-secondary transition-all">
                            <div className="w-full h-full rounded-full overflow-hidden shrink-0">
                                <img
                                    src={category.image}
                                    alt={category.name || category.ar_name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555529771-835f59bfc50c?auto=format&w=200&q=80';
                                    }}
                                />
                            </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 text-center group-hover:text-primary capitalize line-clamp-1 break-all px-1">
                            {category.name || category.ar_name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
