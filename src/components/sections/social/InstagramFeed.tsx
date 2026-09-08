"use client";

import React from 'react';
import { Instagram, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface UGCPost {
    id: number;
    image: string;
    likes: number;
    username: string;
    productLink: string;
}

const UGC_POSTS: UGCPost[] = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
        likes: 420,
        username: "@fashion_luna",
        productLink: "/categories",
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80",
        likes: 582,
        username: "@karim_style",
        productLink: "/categories",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80",
        likes: 319,
        username: "@sara_outfits",
        productLink: "/categories",
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80",
        likes: 741,
        username: "@nour_trends",
        productLink: "/categories",
    },
    {
        id: 5,
        image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&auto=format&fit=crop&q=80",
        likes: 624,
        username: "@lifestyle_hub",
        productLink: "/categories",
    },
    {
        id: 6,
        image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&auto=format&fit=crop&q=80",
        likes: 890,
        username: "@maya_chic",
        productLink: "/categories",
    }
];

interface InstagramFeedProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function InstagramFeed({
    title,
    subtitle
}: InstagramFeedProps) {
    return (
        <section className="w-full py-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                    <span className="text-xs font-black uppercase tracking-widest text-secondary block mb-1 flex items-center gap-1.5">
                        <Instagram size={14} />
                        {subtitle || "#ShopTheLook"}
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tracking-tight">
                        {title || "Real Looks from Our Community"}
                    </h2>
                </div>
                <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-gray-500 hover:text-secondary flex items-center gap-1 transition-colors"
                >
                    Follow on Instagram &rarr;
                </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {UGC_POSTS.map((post) => (
                    <Link
                        key={post.id}
                        href={post.productLink}
                        className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                        <img
                            src={post.image}
                            alt={post.username}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-white text-center gap-2">
                            <span className="text-xs font-bold">{post.username}</span>
                            <div className="flex items-center gap-1 text-xs text-red-400 font-semibold">
                                <Heart size={14} className="fill-current" />
                                <span>{post.likes}</span>
                            </div>
                            <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 mt-1">
                                <ShoppingBag size={12} /> Shop Item
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
