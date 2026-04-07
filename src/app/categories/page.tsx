"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Category, Product } from '@/types/api';
import DynamicBanner from '@/components/common/DynamicBanner';
import { Loader2, Grid } from 'lucide-react';
import ProductCard from '@/components/modules/products/ProductCard';
import { useSelector } from 'react-redux';

export default function CategoriesPage() {
    const { data: categoriesData, isLoading: isLoadingCats } = useGet<ApiResponse<Category>>(['categories'], '/category');
    const { data: productsData, isLoading: isLoadingProds } = useGet<ApiResponse<Product>>(['products'], '/product');
    const user = useSelector((state: any) => state.auth);

    if (isLoadingCats || isLoadingProds) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center grayscale opacity-20">
                <Loader2 className="animate-spin text-secondary mb-4" size={48} />
                <p className="font-bold uppercase tracking-widest text-xs">Curating Collections...</p>
            </div>
        );
    }

    const categories = categoriesData?.data?.data || [];
    const products = productsData?.data?.data || [];

    if (categories.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Grid className="text-gray-200" size={40} />
                </div>
                <h3 className="text-xl font-black text-primary mb-2">No collections found</h3>
                <p className="text-gray-400 font-medium max-w-xs">We're currently updating our catalog. Please check back soon.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            {/* Creative Hero Section */}
            <section className="relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden mb-8 bg-primary">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10" />
                    <DynamicBanner
                        pageName="category"
                        fallbackImage="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                        alt="Categories"
                        className="w-full h-full object-cover scale-110 blur-sm opacity-50"
                    />
                </div>

                <div className="relative z-20 container mx-auto px-6 text-center md:text-left">
                    <div className="inline-block px-4 py-1.5 bg-secondary/20 backdrop-blur-md border border-secondary/30 rounded-full text-secondary text-xs font-black uppercase tracking-[0.2em] mb-6 animate-in slide-in-from-bottom-4 duration-700">
                        Explore Catalog
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-6 animate-in slide-in-from-bottom-6 duration-1000">
                        Shop By <br />
                        <span className="text-secondary italic">Collection.</span>
                    </h1>
                    <p className="text-white/60 text-lg md:text-xl font-medium max-w-xl leading-relaxed animate-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Discover a curated range of premium products organized by lifestyle and preference.
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
            </section>

            <div className="container py-4">
                <div className="flex flex-col gap-20">
                    {categories.map((category) => {
                        const categoryProducts = products.filter(p => {
                            // Check for categoryId array (old/other schema)
                            const matchesIdArray = p.categoryId?.some(cat => cat._id === category._id);
                            // Check for category object (new schema seen in logs)
                            const matchesCategoryObj = p.category?._id === category._id;
                            
                            return matchesIdArray || matchesCategoryObj;
                        });
                        
                        if (categoryProducts.length === 0) return null;

                        return (
                            <div key={category._id} id={category._id} className="scroll-mt-32">
                                {/* Glassmorphism Category Header */}
                                <div className="relative group mb-10">
                                    <div className="absolute -inset-4 bg-gradient-to-r from-gray-100 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="w-24 h-24 rounded-[32px] overflow-hidden bg-white shadow-2xl shadow-gray-200/50 p-1 shrink-0 transform group-hover:-rotate-3 transition-transform duration-500">
                                            <div className="w-full h-full rounded-[28px] overflow-hidden">
                                                <img
                                                    src={category.image}
                                                    alt={category.name || category.ar_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tighter capitalize">
                                                    {category.name || category.ar_name}
                                                </h2>
                                                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black rounded-full uppercase tracking-widest">
                                                    {categoryProducts.length} Products
                                                </span>
                                            </div>
                                            <div className="h-1 w-20 bg-secondary rounded-full transform origin-left group-hover:scale-x-150 transition-transform duration-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Product Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
                                    {categoryProducts.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
