"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface MinimalHeroProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function MinimalHero({ title, subtitle }: MinimalHeroProps) {
    return (
        <section className="w-full py-12 md:py-16 text-center">
            <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold tracking-wider">
                    <Sparkles size={14} className="text-secondary" />
                    <span>{subtitle || "Simple, Elegant & Modern"}</span>
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-primary tracking-tight leading-tight">
                    {title || "Less is More. Shop Premium Quality."}
                </h1>

                <p className="text-gray-500 text-base md:text-xl max-w-2xl font-normal leading-relaxed">
                    Carefully curated collections with timeless aesthetics, pure craftsmanship, and seamless online shopping experience.
                </p>

                <div className="flex items-center gap-4 pt-4">
                    <Link
                        href="/categories"
                        className="bg-primary text-white hover:bg-secondary px-8 py-3.5 rounded-full font-bold text-sm md:text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                        Browse All Items
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
