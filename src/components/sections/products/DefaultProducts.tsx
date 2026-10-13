"use client";
import React from 'react';
import { usePaginatedGet } from '@/hooks/usePaginatedGet';
import { Product } from '@/types/api';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import ProductCard from '@/components/modules/products/ProductCard';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductsSectionProps {
    searchQuery?: string;
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function DefaultProducts({
    searchQuery = "",
    title,
    subtitle
}: ProductsSectionProps) {
    const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
        usePaginatedGet<Product>(['products', 'default-section'], '/product', 12);
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-secondary" size={40} />
                <p className="text-gray-400 text-sm font-medium animate-pulse">{t.common.loading}</p>
            </div>
        );
    }

    if (error) return <p role="alert" className="py-8 text-center text-red-600">{t.common.error}</p>;

    const allProducts = (data?.pages.flatMap((page) => page.data?.data || []) || [])
        .filter((product) => product.is_featured === true);

    const filteredProducts = allProducts.filter(p =>
        !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.ar_name && p.ar_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (allProducts.length === 0 && !hasNextPage) return null;

    return (
        <section className="w-full py-10 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={16} className="text-secondary" />
                        <span className="text-xs font-black uppercase tracking-widest text-secondary">
                            {subtitle || "Handpicked For You"}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                        {title || (searchQuery ? `Featured Search Results (${filteredProducts.length})` : "Featured Products")}
                    </h2>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-3xl">
                    <p className="text-gray-500 font-medium">No products found matching your criteria.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </>
            )}
            {hasNextPage && (
                <div className="flex justify-center mt-12">
                    <button
                        onClick={() => void fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="px-8 py-3.5 bg-white border-2 border-gray-200 text-primary font-bold rounded-2xl hover:border-secondary hover:text-secondary hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:cursor-wait disabled:opacity-70"
                    >
                        {isFetchingNextPage ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        {isFetchingNextPage ? t.common.loadingMore : t.product.loadMore}
                    </button>
                </div>
            )}
            {error && <p role="alert" className="mt-4 text-center text-red-600">{t.common.error}</p>}
        </section>
    );
}
