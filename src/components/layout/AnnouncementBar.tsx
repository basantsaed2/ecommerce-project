"use client";

import React, { useState } from 'react';
import { Sparkles, Truck, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AnnouncementBarProps {
    message?: string;
    couponCode?: string;
    linkUrl?: string;
    linkText?: string;
}

export default function AnnouncementBar({
    message = "Free Express Shipping on Orders Over 500 EGP",
    couponCode = "SAVE20",
    linkUrl = "/categories",
    linkText = "Shop Now"
}: AnnouncementBarProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-primary text-white text-xs font-semibold py-2 px-4 relative z-[60] border-b border-white/10 transition-all duration-300">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Left empty spacer for perfect center alignment on desktop */}
                <div className="hidden md:flex items-center gap-2 text-white/70 text-[11px]">
                    <Truck size={14} className="text-secondary" />
                    <span>Free Nationwide Delivery</span>
                </div>

                {/* Center Content */}
                <div className="flex-1 flex items-center justify-center gap-2 text-center flex-wrap">
                    <span className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-secondary animate-pulse" />
                        <span>{message}</span>
                    </span>

                    {couponCode && (
                        <span className="bg-white/20 text-white px-2 py-0.5 rounded font-black tracking-wider uppercase text-[10px]">
                            Code: {couponCode}
                        </span>
                    )}

                    {linkUrl && (
                        <Link 
                            href={linkUrl} 
                            className="underline underline-offset-4 text-secondary hover:text-white font-bold ml-1 inline-flex items-center gap-0.5"
                        >
                            {linkText} <ArrowRight size={12} />
                        </Link>
                    )}
                </div>

                {/* Right Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    aria-label="Close Announcement"
                    className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
