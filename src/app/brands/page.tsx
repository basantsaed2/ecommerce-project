"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Brand, Product } from '@/types/api';
import { Loader2, Briefcase, Award, Star } from 'lucide-react';
import ProductCard from '@/components/modules/products/ProductCard';

export default function BrandsPage() {
    const { data: brandsData, isLoading: isLoadingBrands } = useGet<ApiResponse<Brand>>(['brands'], '/brand');
    const { data: productsData, isLoading: isLoadingProds } = useGet<ApiResponse<Product>>(['products'], '/product');

    if (isLoadingBrands || isLoadingProds) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center grayscale opacity-20">
                <Loader2 className="animate-spin text-secondary mb-4" size={48} />
                <p className="font-bold uppercase tracking-widest text-xs tracking-[0.3em]">Connecting with Partners...</p>
            </div>
        );
    }

    const brands = brandsData?.data?.data || [];
    const products = productsData?.data?.data || [];

    if (brands.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Briefcase className="text-gray-200" size={40} />
                </div>
                <h3 className="text-xl font-black text-primary mb-2">No partners found</h3>
                <p className="text-gray-400 font-medium max-w-xs">We're currently onboarding new global brands. Stay tuned.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Elite Brand Hub Hero */}
            <section className="relative h-[450px] md:h-[550px] flex items-center overflow-hidden mb-8 bg-black">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1534452203294-49c8ad1bc00c?q=80&w=2070&auto=format&fit=crop"
                        alt="Brands Hub"
                        className="w-full h-full object-cover opacity-40 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="relative z-20 container mx-auto px-6">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-4 mb-8 animate-in slide-in-from-left-4 duration-700">
                            <span className="w-12 h-px bg-secondary" />
                            <span className="text-secondary text-sm font-black uppercase tracking-[0.4em]">The Elite Selection</span>
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-8 animate-in slide-in-from-left-6 duration-1000">
                            The <br />
                            <span className="text-secondary">Brand</span> Hub<span className="text-secondary text-5xl md:text-7xl">.</span>
                        </h1>
                        <p className="text-gray-400 text-lg md:text-2xl font-medium max-w-2xl leading-relaxed animate-in slide-in-from-left-8 duration-1000 delay-200">
                            Partnering with the world's most trusted manufacturers to bring quality directly to your doorstep.
                        </p>
                    </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute bottom-12 right-12 hidden lg:flex items-center gap-12 text-white/40">
                    <div className="text-center">
                        <p className="text-3xl font-black text-white mb-1">{brands.length}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest">Global Partners</p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-center">
                        <p className="text-3xl font-black text-white mb-1">{products.length}+</p>
                        <p className="text-[10px] font-black uppercase tracking-widest">Curated Items</p>
                    </div>
                </div>
            </section>

            <div className="container py-4">
                <div className="flex flex-col gap-24">
                    {brands.map((brand) => {
                        const brandProducts = products.filter(p => p.brandId === brand._id);
                        if (brandProducts.length === 0) return null;

                        return (
                            <div key={brand._id} id={brand._id} className="scroll-mt-32 group">
                                {/* Premium Brand Showcase Header */}
                                <div className="flex flex-col md:flex-row items-center gap-10 mb-12 relative">
                                    <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-secondary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                    <div className="relative w-32 h-32 md:w-44 md:h-28 bg-white overflow-hidden shrink-0 flex items-center justify-center rounded-[32px] p-6 shadow-xl shadow-gray-100 border border-gray-50 transform group-hover:scale-105 transition-all duration-500">
                                        <img
                                            src={brand.logo}
                                            alt={brand.name || brand.ar_name}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>

                                    <div className="text-center md:text-left flex-1">
                                        <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
                                            <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter capitalize leading-none">
                                                {brand.name || brand.ar_name}
                                            </h2>
                                            <div className="flex items-center justify-center md:justify-start gap-1 py-1 px-3 bg-secondary/10 rounded-full">
                                                <Award size={12} className="text-secondary" />
                                                <span className="text-secondary text-[10px] font-black uppercase tracking-widest">Verified Merchant</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center md:justify-start gap-3">
                                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                            <span>Premier Collection • {brandProducts.length} Items Available</span>
                                        </p>
                                    </div>

                                    <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
                                </div>

                                {/* Luxury Product Display */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
                                    {brandProducts.map(product => (
                                        <div key={product._id} className="transform hover:-translate-y-2 transition-transform duration-500">
                                            <ProductCard product={product} />
                                        </div>
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
