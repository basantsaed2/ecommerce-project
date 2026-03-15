"use client";
import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Brand } from '@/types/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BrandsSection() {
    const { data, isLoading, error } = useGet<ApiResponse<Brand>>(['brands'], '/api/store/brand');

    if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-secondary" /></div>;
    if (error) return null;

    const brands = data?.data?.data || [];

    if (brands.length === 0) return null;

    return (
        <section className="w-full px-4 py-12">
            <div className="flex flex-col items-center text-center mb-10">
                <h2 className="text-3xl font-black text-primary tracking-tight">Top <span className="text-secondary">Brands</span></h2>
                <p className="text-gray-500 text-sm mt-2 font-medium">Discover products from your favorite and trusted brands.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                {brands.map((brand) => (
                    <Link key={brand._id} href={`/brands#${brand._id}`} className="w-32 h-20 md:w-40 md:h-24 bg-white border border-gray-100 rounded-2xl flex items-center justify-center p-4 hover:shadow-lg hover:border-secondary/30 transition-all group grayscale hover:grayscale-0">
                        <img
                            src={brand.logo}
                            alt={brand.name || brand.ar_name}
                            className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-110"
                        />
                    </Link>
                ))}
            </div>
        </section>
    );
}
