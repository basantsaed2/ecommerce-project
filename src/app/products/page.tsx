"use client";

import React from "react";
import { Loader2, Search } from "lucide-react";
import ProductCard from "@/components/modules/products/ProductCard";
import { usePaginatedGet } from "@/hooks/usePaginatedGet";
import { useTranslation } from "@/hooks/useTranslation";
import { Product } from "@/types/api";

export default function ProductsPage() {
    const { t } = useTranslation();
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = usePaginatedGet<Product>(["products", "all-products-page"], "/product", 20);

    const products = data?.pages.flatMap((page) => page.data?.data || []) || [];

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-secondary" size={40} />
                <p className="text-sm font-bold text-gray-500">{t.common.loading}</p>
            </div>
        );
    }

    if (error) {
        return <p role="alert" className="py-20 text-center text-red-600">{t.common.error}</p>;
    }

    return (
        <main className="mx-auto min-h-[70vh] max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="mb-8 text-3xl font-black text-primary sm:text-4xl">{t.sections.allProducts}</h1>

            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-20 text-center">
                    <Search className="mb-4 text-gray-300" size={40} />
                    <p className="font-bold text-gray-600">{t.home.noProductsFound}</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
                        {products.map((product) => <ProductCard key={product._id} product={product} />)}
                    </div>

                    {hasNextPage && (
                        <div className="mt-10 flex justify-center">
                            <button
                                type="button"
                                onClick={() => void fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="rounded-full bg-primary px-8 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                            >
                                {isFetchingNextPage ? t.common.loadingMore : t.product.loadMore}
                            </button>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
