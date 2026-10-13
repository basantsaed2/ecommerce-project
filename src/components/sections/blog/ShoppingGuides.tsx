"use client";

import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface Article {
    id: number;
    readTime: number;
    image: string;
}

const ARTICLES: Article[] = [
    {
        id: 1,
        readTime: 4,
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80",
    },
    {
        id: 2,
        readTime: 6,
        image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80",
    },
    {
        id: 3,
        readTime: 3,
        image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&auto=format&fit=crop&q=80",
    }
];

interface ShoppingGuidesProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function ShoppingGuides({
    title,
    subtitle
}: ShoppingGuidesProps) {
    const { t, language } = useTranslation();
    const articleText = [
        { title: t.sections.capsuleWardrobeTitle, excerpt: t.sections.capsuleWardrobeExcerpt, category: t.sections.styleGuide },
        { title: t.sections.fabricGuideTitle, excerpt: t.sections.fabricGuideExcerpt, category: t.sections.fabricCare },
        { title: t.sections.accessorizingTitle, excerpt: t.sections.accessorizingExcerpt, category: t.sections.fashionTips },
    ];
    const articleDate = new Date(2026, 8, 1).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        year: 'numeric',
    });
    return (
        <section className="w-full py-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                    <span className="text-xs font-black uppercase tracking-widest text-secondary block mb-1">
                        {subtitle || t.sections.editorialInsights}
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tracking-tight">
                        {title || t.sections.shoppingGuidesStyleTips}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ARTICLES.map((article, index) => (
                    <article
                        key={article.id}
                        className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                    >
                        <div>
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={articleText[index].title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-primary border border-gray-100">
                                    {articleText[index].category}
                                </span>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-3 text-xs text-gray-400 font-semibold mb-3">
                                    <span>{articleDate}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {article.readTime} {t.sections.minRead}
                                    </span>
                                </div>

                                <h3 className="text-lg font-black text-primary group-hover:text-secondary transition-colors mb-2 leading-snug">
                                    {articleText[index].title}
                                </h3>

                                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-2">
                                    {articleText[index].excerpt}
                                </p>
                            </div>
                        </div>

                        <div className="px-6 pb-6 pt-0">
                            <span className="text-xs font-bold text-secondary inline-flex items-center gap-1 group-hover:underline">
                                {t.sections.readFullGuide} <ArrowRight size={14} />
                            </span>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
