"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Brand, Product } from '@/types/api';
import { Loader2 } from 'lucide-react';
import ProductCard from '@/components/modules/products/ProductCard';

export default function BrandsPage() {
    const { data: brandsData, isLoading: isLoadingBrands } = useGet<ApiResponse<Brand>>(['brands'], '/api/store/brand');
    const { data: productsData, isLoading: isLoadingProds } = useGet<ApiResponse<Product>>(['products'], '/api/store/product');

    if (isLoadingBrands || isLoadingProds) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-secondary" size={40} />
            </div>
        );
    }

    const brands = brandsData?.data?.data || [];
    const products = productsData?.data?.data || [];

    if (brands.length === 0) {
        return <div className="text-center py-20 text-gray-500 font-bold">No brands found.</div>;
    }

    return (
        <div className="w-full px-2 md:px-6 py-8">
            <div className="mb-12 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">
                    Top <span className="text-secondary">Brands</span>
                </h1>
                <p className="text-gray-500 mt-3 font-medium">Discover top-quality products from brands you trust.</p>
            </div>

            <div className="flex flex-col gap-12">
                {brands.map((brand) => {
                    const brandProducts = products.filter(p => p.brandId === brand._id);

                    if (brandProducts.length === 0) return null; // Don't show empty brands

                    return (
                        <div key={brand._id} id={brand._id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-50 scroll-mt-24">
                            {/* Brand Header */}
                            <div className="flex items-center gap-6 mb-8 pb-4 border-b border-gray-100">
                                <div className="w-24 h-16 bg-white overflow-hidden shrink-0 flex items-center justify-center rounded-xl p-2 border border-gray-50 shadow-sm">
                                    <img
                                        src={brand.logo}
                                        alt={brand.name || brand.ar_name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-primary capitalize">{brand.name || brand.ar_name}</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{brandProducts.length} Items</p>
                                </div>
                            </div>

                            {/* Product List */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {brandProducts.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
