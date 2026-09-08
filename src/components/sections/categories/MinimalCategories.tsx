"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Category } from '@/types/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface MinimalCategoriesProps {
    searchQuery?: string;
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function MinimalCategories({
    searchQuery = "",
    title,
    subtitle
}: MinimalCategoriesProps) {
    const { data, isLoading, error } = useGet<ApiResponse<Category>>(['categories'], '/category');

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-secondary" size={32} />
            </div>
        );
    }
    if (error) return null;

    const categories = data?.data?.data || [];
    if (categories.length === 0) return null;

    return (
        <section className="w-full py-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">
                    {title || "Categories"}
                </h3>
                <Link href="/categories" className="text-xs font-semibold text-secondary hover:underline">
                    View All
                </Link>
            </div>
            <div className="flex flex-wrap gap-2.5">
                {categories.map((cat) => (
                    <Link
                        key={cat._id}
                        href={`/categories?id=${cat._id}`}
                        className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-secondary hover:text-secondary hover:bg-secondary/5 transition-all shadow-xs"
                    >
                        {cat.name || cat.ar_name}
                    </Link>
                ))}
            </div>
        </section>
    );
}
