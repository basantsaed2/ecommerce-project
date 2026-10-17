"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface MinimalHeroProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function MinimalHero({ title, subtitle }: MinimalHeroProps) {
    const { t } = useTranslation();
    return (
        <section className="w-full py-12 md:py-16 text-center">
            <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold tracking-wider">
                    <Sparkles size={14} className="text-secondary" />
                    <span>{subtitle || t.sections.simpleElegantModern}</span>
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-primary tracking-tight leading-tight">
                    {title || t.sections.lessIsMore}
                </h1>

                <p className="text-gray-500 text-base md:text-xl max-w-2xl font-normal leading-relaxed">
                    {t.sections.minimalHeroDescription}
                </p>

                <div className="flex items-center gap-4 pt-4">
                    <Link
                        href="/categories"
                        className="bg-primary text-white hover:bg-secondary px-8 py-3.5 rounded-full font-bold text-sm md:text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                        {t.sections.browseAllItems}
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
