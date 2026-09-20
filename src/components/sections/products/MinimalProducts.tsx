"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Product } from '@/types/api';
import { Loader2 } from 'lucide-react';
import ProductCard from '@/components/modules/products/ProductCard';

interface MinimalProductsProps {
    searchQuery?: string;
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function MinimalProducts({
    searchQuery = "",
    title,
}: MinimalProductsProps) {
    const { data, isLoading, error } = useGet<ApiResponse<Product>>(['products'], '/product');

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-secondary" size={32} />
            </div>
        );
    }
    if (error) return null;

    const allProducts = (data?.data?.data || []).filter((product) => product.is_featured === true);
    const filtered = allProducts.filter(p =>
        !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.ar_name && p.ar_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <section className="w-full py-8">
            <h2 className="text-2xl font-bold text-primary mb-6">
                {title || "Featured Products"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filtered.slice(0, 8).map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </section>
    );
}
