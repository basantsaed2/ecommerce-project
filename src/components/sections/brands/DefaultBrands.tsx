"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Brand } from '@/types/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface BrandsProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function DefaultBrands({
    title,
    subtitle
}: BrandsProps) {
    const { data, isLoading, error } = useGet<ApiResponse<Brand>>(['brands'], '/brand');

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-secondary" size={32} />
            </div>
        );
    }
    if (error) return null;

    const brands = data?.data?.data || [];
    if (brands.length === 0) return null;

    const midPoint = Math.ceil(brands.length / 2);
    const firstRow = brands.slice(0, midPoint);
    const secondRow = brands.slice(midPoint);

    return (
        <section className="w-full py-16 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden my-6">
            <div className="flex flex-col items-center text-center mb-10 px-6">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-2 block">
                    {subtitle || "Official Partners"}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tight">
                    {title || "Shop Top Featured Brands"}
                </h2>
            </div>

            <div className="flex flex-col gap-6">
                {/* Row 1 */}
                <div className="relative flex overflow-hidden">
                    <div className="animate-marquee flex items-center gap-6 py-2">
                        {[...firstRow, ...firstRow, ...firstRow].map((brand, idx) => (
                            <Link
                                key={`${brand._id}-r1-${idx}`}
                                href={`/brands#${brand._id}`}
                                className="min-w-[160px] md:min-w-[200px] h-20 md:h-28 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl flex items-center justify-center p-4 hover:shadow-xl hover:border-secondary/30 transition-all duration-300 group"
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name || brand.ar_name}
                                    className="max-w-[85%] max-h-[85%] object-contain transition-all duration-300 group-hover:scale-105"
                                />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Row 2 (if enough brands) */}
                {secondRow.length > 0 && (
                    <div className="relative flex overflow-hidden">
                        <div className="animate-marquee-reverse flex items-center gap-6 py-2">
                            {[...secondRow, ...secondRow, ...secondRow].map((brand, idx) => (
                                <Link
                                    key={`${brand._id}-r2-${idx}`}
                                    href={`/brands#${brand._id}`}
                                    className="min-w-[160px] md:min-w-[200px] h-20 md:h-28 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl flex items-center justify-center p-4 hover:shadow-xl hover:border-secondary/30 transition-all duration-300 group"
                                >
                                    <img
                                        src={brand.logo}
                                        alt={brand.name || brand.ar_name}
                                        className="max-w-[85%] max-h-[85%] object-contain transition-all duration-300 group-hover:scale-105"
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
