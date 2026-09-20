"use client";

import React from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Product } from '@/types/api';
import ProductCard from '@/components/modules/products/ProductCard';

interface BestSellersSectionProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
    searchQuery?: string;
}

export default function BestSellersSection({
    title,
    subtitle,
    searchQuery = '',
}: BestSellersSectionProps) {
    const { data, isLoading, error } = useGet<ApiResponse<Product>>(
        ['best-sellers'],
        '/product/best-sellers'
    );

    if (isLoading) {
        return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-secondary" size={32} /></div>;
    }

    if (error) return null;

    const query = searchQuery.trim().toLowerCase();
    const products = (data?.data?.data || [])
        .filter((product) => !query || product.name?.toLowerCase().includes(query) || product.ar_name?.toLowerCase().includes(query))
        .slice(0, 8);

    if (products.length === 0) return null;

    return (
        <section className="w-full py-10 px-4 md:px-6">
            <div className="max-w-[1240px] mx-auto">
                <div className="flex items-end justify-between gap-4 mb-8">
                    <div>
                        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-secondary mb-2">
                            <TrendingUp size={15} /> {subtitle || 'Top performers'}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                            {title || 'Best Sellers'}
                        </h2>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product) => <ProductCard key={product._id} product={product} />)}
                </div>
            </div>
        </section>
    );
}