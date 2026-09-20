"use client";

import React from 'react';
import Link from 'next/link';
import { Loader2, Tag } from 'lucide-react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Product } from '@/types/api';
import ProductCard from '@/components/modules/products/ProductCard';

interface OfferRecord {
    _id: string;
    name?: string;
    title?: string;
    description?: string;
    image?: string;
    discount?: number | string;
    products?: Product[];
    product?: Product;
}

interface OffersSectionProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function OffersSection({ title, subtitle }: OffersSectionProps) {
    const { data, isLoading, error } = useGet<ApiResponse<OfferRecord>>(['offers'], '/offer');

    if (isLoading) {
        return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-secondary" size={32} /></div>;
    }

    if (error) return null;

    const offers = data?.data?.data || [];
    if (offers.length === 0) return null;

    const offerProducts = offers.flatMap((offer) => [
        ...(offer.products || []),
        ...(offer.product ? [offer.product] : []),
    ]);

    return (
        <section className="w-full py-10 px-4 md:px-6">
            <div className="max-w-[1240px] mx-auto">
                <div className="flex items-end justify-between gap-4 mb-8">
                    <div>
                        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-secondary mb-2">
                            <Tag size={15} /> {subtitle || 'Limited time'}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                            {title || 'Special Offers'}
                        </h2>
                    </div>
                </div>

                {offerProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {offerProducts.map((product, index) => (
                            <ProductCard key={`${product._id}-${index}`} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {offers.map((offer) => (
                            <Link
                                key={offer._id}
                                href={`/offer/${offer._id}`}
                                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                {offer.image && <img src={offer.image} alt={offer.title || offer.name || 'Offer'} className="mb-4 h-40 w-full rounded-xl object-cover" />}
                                <h3 className="text-lg font-black text-primary">{offer.title || offer.name}</h3>
                                {offer.description && <p className="mt-2 text-sm text-gray-500">{offer.description}</p>}
                                {offer.discount && <p className="mt-4 font-black text-secondary">{offer.discount}% OFF</p>}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}