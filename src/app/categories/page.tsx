"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Category, Product } from '@/types/api';
import { Loader2 } from 'lucide-react';
import ProductCard from '@/components/modules/products/ProductCard';

export default function CategoriesPage() {
    const { data: categoriesData, isLoading: isLoadingCats } = useGet<ApiResponse<Category>>(['categories'], '/api/store/category');
    const { data: productsData, isLoading: isLoadingProds } = useGet<ApiResponse<Product>>(['products'], '/api/store/product');

    if (isLoadingCats || isLoadingProds) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-secondary" size={40} />
            </div>
        );
    }

    const categories = categoriesData?.data?.data || [];
    const products = productsData?.data?.data || [];

    if (categories.length === 0) {
        return <div className="text-center py-20 text-gray-500 font-bold">No categories found.</div>;
    }

    return (
        <div className="w-full px-2 md:px-6 py-8">
            <div className="mb-12 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">
                    Shop by <span className="text-secondary">Category</span>
                </h1>
                <p className="text-gray-500 mt-3 font-medium">Explore our wide range of categories and find exactly what you need.</p>
            </div>

            <div className="flex flex-col gap-12">
                {categories.map((category) => {
                    const categoryProducts = products.filter(p => p.categoryId.includes(category._id));

                    if (categoryProducts.length === 0) return null; // Don't show empty categories

                    return (
                        <div key={category._id} id={category._id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-50 scroll-mt-24">
                            {/* Category Header */}
                            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-sm border border-gray-100 shrink-0 p-1">
                                    <div className="w-full h-full rounded-full overflow-hidden shrink-0">
                                        <img
                                            src={category.image}
                                            alt={category.name || category.ar_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-primary capitalize">{category.name || category.ar_name}</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{categoryProducts.length} Items</p>
                                </div>
                            </div>

                            {/* Product List */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {categoryProducts.map(product => (
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
