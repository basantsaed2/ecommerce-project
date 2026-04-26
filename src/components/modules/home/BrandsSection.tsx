"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Brand } from '@/types/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BrandsSection() {
    const { data, isLoading, error } = useGet<ApiResponse<Brand>>(['brands'], '/brand');

    if (isLoading) return (
        <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-secondary" size={32} />
        </div>
    );
    if (error) return null;

    const brands = data?.data?.data || [];
    if (brands.length === 0) return null;

    const midPoint = Math.ceil(brands.length / 2);
    const firstRow = brands.slice(0, midPoint);
    const secondRow = brands.slice(midPoint);

    return (
        <section className="w-full py-24 bg-white/30 backdrop-blur-xl rounded-[5rem] mt-16 border border-white/40 shadow-2xl shadow-primary/5 overflow-hidden">
            <div className="flex flex-col items-center text-center mb-16 px-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-12 h-[2px] bg-secondary/30" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-secondary">Global Partners</span>
                    <span className="w-12 h-[2px] bg-secondary/30" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-tight">
                    Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-pulse">Industry Leaders</span>
                </h2>
            </div>

            <div className="flex flex-col gap-8">
                {/* Row 1: Left Scroll */}
                <div className="relative flex overflow-hidden">
                    <div className="animate-marquee flex items-center gap-6 py-2">
                        {[...firstRow, ...firstRow, ...firstRow].map((brand, idx) => (
                            <Link
                                key={`${brand._id}-r1-${idx}`}
                                href={`/brands#${brand._id}`}
                                className="min-w-[180px] md:min-w-[240px] h-24 md:h-32 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-[2rem] flex items-center justify-center p-8 hover:shadow-2xl hover:shadow-secondary/10 hover:border-secondary/20 transition-all duration-700 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <img
                                    src={brand.logo}
                                    alt={brand.name || brand.ar_name}
                                    className="max-w-[70%] max-h-[70%] object-contain transition-all duration-700 group-hover:scale-110 relative z-10"
                                />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Row 2: Right Scroll */}
                <div className="relative flex overflow-hidden">
                    <div className="animate-marquee-reverse flex items-center gap-6 py-2">
                        {[...secondRow, ...secondRow, ...secondRow].map((brand, idx) => (
                            <Link
                                key={`${brand._id}-r2-${idx}`}
                                href={`/brands#${brand._id}`}
                                className="min-w-[180px] md:min-w-[240px] h-24 md:h-32 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-[2rem] flex items-center justify-center p-8 hover:shadow-2xl hover:shadow-secondary/10 hover:border-secondary/20 transition-all duration-700 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <img
                                    src={brand.logo}
                                    alt={brand.name || brand.ar_name}
                                    className="max-w-[100%] max-h-[100%] object-contain transition-all duration-700 group-hover:scale-110 relative z-10"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Glassy Fades */}
            <div className="absolute top-0 left-0 h-full w-40 bg-gradient-to-r from-white via-white/40 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-40 bg-gradient-to-l from-white via-white/40 to-transparent z-10 pointer-events-none" />
        </section>
    );
}
