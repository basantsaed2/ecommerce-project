"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Banner } from '@/types/api';
import { Loader2, ArrowUpRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';

interface ModernHeroProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function ModernHero({ title, subtitle }: ModernHeroProps) {
    const { data: bannersData, isLoading } = useGet<ApiResponse<Banner>>(['banners'], '/banner');
    const bannersList = bannersData?.data?.data || [];
    const banner = bannersList[0];
    
    const bannerImage = banner?.images?.[0] || "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop";

    if (isLoading) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-3xl animate-pulse">
                <Loader2 className="animate-spin text-secondary" size={40} />
            </div>
        );
    }

    return (
        <section className="w-full py-6">
            <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent rounded-[2.5rem] p-6 sm:p-10 md:p-14 border border-gray-100 shadow-xl overflow-hidden relative">
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl -z-0 translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-0 -translate-x-1/3 translate-y-1/3" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    {/* Text Column */}
                    <div className="lg:col-span-7 flex flex-col items-start gap-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-xs font-black uppercase tracking-wider border border-secondary/20">
                            <Sparkles size={14} className="animate-spin" />
                            {subtitle || "Curated Modern Selection"}
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-[1.1]">
                            {title || "Discover Modern Trends & Premium Essentials"}
                        </h1>

                        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xl font-medium leading-relaxed">
                            Upgrade your lifestyle with our highest-rated products. Fast shipping, guaranteed authenticity, and unbeatable seasonal prices.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link 
                                href="/categories" 
                                className="bg-primary text-white hover:bg-secondary px-8 py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-xl shadow-primary/20 hover:shadow-secondary/30 transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                Explore Collection
                                <ArrowUpRight size={18} />
                            </Link>

                            <Link 
                                href="/brands" 
                                className="bg-white text-primary border border-gray-200 hover:border-secondary px-6 py-4 rounded-2xl font-bold text-sm sm:text-base hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Top Brands
                            </Link>
                        </div>

                        <div className="flex items-center gap-6 pt-4 border-t border-gray-200/70 w-full text-xs font-semibold text-gray-500">
                            <div className="flex items-center gap-2">
                                <Truck size={16} className="text-secondary" />
                                <span>Express Free Delivery</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-secondary" />
                                <span>100% Authentic Quality</span>
                            </div>
                        </div>
                    </div>

                    {/* Image Column */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] lg:aspect-square group">
                            <img
                                src={bannerImage}
                                alt="Modern Shop Hero"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                                <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-white/40">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trending Now</p>
                                    <p className="text-sm sm:text-base font-black text-primary">Special Limited Offers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
