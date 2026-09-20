"use client";
import React from 'react';
import Link from 'next/link';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';
import { Heart, Instagram, Facebook, Twitter } from 'lucide-react';

interface ModernFooterProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function ModernFooter({ title }: ModernFooterProps) {
    const { settings, storeName, logoUrl } = useStoreSettings();
    const ecommerceData = settings.ecommerceData?.[0];
    const socialLinks = ecommerceData?.social_links || {};
    const footer = ecommerceData?.footer || {};
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-gray-900 text-white mt-20 pt-16 pb-12 rounded-t-[3rem]">
            <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center gap-8">
                {/* Logo & Name */}
                <Link href="/" className="flex items-center gap-2">
                    {footer.logo || logoUrl ? (
                        <img src={footer.logo || logoUrl || undefined} alt={storeName} className="h-10 max-w-[200px] object-contain brightness-0 invert" />
                    ) : (
                        <span className="text-3xl font-black tracking-tighter text-white">
                            {storeName || 'STORE'}<span className="text-secondary">.</span>
                        </span>
                    )}
                </Link>

                <p className="text-gray-400 text-sm max-w-md">
                    {footer.bio || ecommerceData?.bio || 'Curated collections for modern living. Fast shipping, guaranteed satisfaction, and friendly customer support.'}
                </p>

                {/* Nav Links */}
                <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-gray-300">
                    <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
                    <Link href="/categories" className="hover:text-secondary transition-colors">Categories</Link>
                    <Link href="/brands" className="hover:text-secondary transition-colors">Brands</Link>
                    <Link href="/order-tracking" className="hover:text-secondary transition-colors">Track Order</Link>
                    <Link href="/favourite" className="hover:text-secondary transition-colors">Favorites</Link>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-4">
                    <a href={socialLinks.instagram || '#'} className="w-10 h-10 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center text-white transition-colors">
                        <Instagram size={18} />
                    </a>
                    <a href={socialLinks.facebook || '#'} className="w-10 h-10 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center text-white transition-colors">
                        <Facebook size={18} />
                    </a>
                    <a href={socialLinks.twitter || '#'} className="w-10 h-10 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center text-white transition-colors">
                        <Twitter size={18} />
                    </a>
                </div>

                <div className="w-full border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
                    <p>&copy; {currentYear} {storeName || 'Store'}. {footer.copyright || 'All rights reserved.'}</p>
                    <p className="flex items-center gap-1">
                        Crafted with modern dynamic experience
                    </p>
                </div>
            </div>
        </footer>
    );
}
