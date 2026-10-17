"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface PromoBannerItem {
    id: number;
    titleKey: 'womensTrending' | 'mensModern' | 'accessoriesFootwear';
    subtitleKey: 'minimalistFashion' | 'smartCasualStreetwear' | 'comfortElegance';
    badgeKey: 'upTo40Off' | 'newArrival' | 'bestValue';
    image: string;
    link: string;
    colorClass: string;
}

const PROMO_CARDS: PromoBannerItem[] = [
    {
        id: 1,
        titleKey: 'womensTrending',
        subtitleKey: 'minimalistFashion',
        badgeKey: 'upTo40Off',
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
        link: "/categories",
        colorClass: "from-purple-900/80 via-black/40",
    },
    {
        id: 2,
        titleKey: 'mensModern',
        subtitleKey: 'smartCasualStreetwear',
        badgeKey: 'newArrival',
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
        link: "/categories",
        colorClass: "from-blue-900/80 via-black/40",
    },
    {
        id: 3,
        titleKey: 'accessoriesFootwear',
        subtitleKey: 'comfortElegance',
        badgeKey: 'bestValue',
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
        link: "/categories",
        colorClass: "from-amber-900/80 via-black/40",
    }
];

interface PromotionalBannersProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function PromotionalBanners({
    title,
    subtitle
}: PromotionalBannersProps) {
    const { t } = useTranslation();

    return (
        <section className="w-full py-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <span className="text-xs font-black uppercase tracking-widest text-secondary block mb-1">
                        {subtitle || t.sections.promoCampaigns}
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tracking-tight">
                        {title || t.sections.specialCollectionsDeals}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PROMO_CARDS.map((item) => (
                    <Link
                        key={item.id}
                        href={item.link}
                        className="group relative h-64 sm:h-72 lg:h-80 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col justify-end p-6 sm:p-7 text-white"
                    >
                        {/* Background Image */}
                        <img
                            src={item.image}
                            alt={t.sections[item.titleKey]}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${item.colorClass} to-transparent transition-opacity duration-500`} />

                        {/* Card Content */}
                        <div className="relative z-10 flex flex-col items-start gap-2">
                            <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/30">
                                {t.sections[item.badgeKey]}
                            </span>

                            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight drop-shadow group-hover:text-secondary transition-colors">
                                {t.sections[item.titleKey]}
                            </h3>

                            <p className="text-xs text-gray-200 font-medium">
                                {t.sections[item.subtitleKey]}
                            </p>

                            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-white bg-white/10 hover:bg-white hover:text-black backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 transition-all">
                                {t.sections.discoverNow}
                                <ArrowUpRight size={14} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
