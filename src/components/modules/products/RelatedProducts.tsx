"use client";

import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Product } from '@/types/api';
import ProductCard from './ProductCard';
import { Sparkles } from 'lucide-react';

interface RelatedProductsProps {
    currentProductId: string;
    categoryId?: string;
}

export default function RelatedProducts({ currentProductId, categoryId }: RelatedProductsProps) {
    const { data } = useGet<ApiResponse<Product>>(['products'], '/product');
    const allProducts = data?.data?.data || [];

    // Filter out current product and find similar category products
    const related = allProducts
        .filter(p => p._id !== currentProductId)
        .slice(0, 4);

    if (related.length === 0) return null;

    return (
        <section className="w-full mt-14 mb-8">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles size={20} className="text-secondary" />
                <h3 className="text-2xl font-black text-primary tracking-tight">
                    You May Also Like
                </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {related.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </section>
    );
}
