"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Product } from '@/types/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '../products/ProductCard';

export default function ProductsSection() {
    const { data, isLoading, error } = useGet<ApiResponse<Product>>(['products'], '/product');

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-secondary" size={32} /></div>;
    if (error) return null;

    const products = data?.data?.data || [];
    
    if (products.length === 0) return null;

    return (
        <section className="w-full px-2 md:px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-primary tracking-tight">Trending <span className="text-secondary">Products</span></h2>
                <Link href="/categories" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">See All &rarr;</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </section>
    );
}
