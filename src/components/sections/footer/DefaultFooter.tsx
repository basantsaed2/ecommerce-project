"use client";
import React from 'react';
import Link from 'next/link';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Category } from '@/types/api';
import {
    MapPin, Phone, Mail, ShieldCheck, Heart,
    Facebook, Twitter, Instagram, Youtube, CreditCard,
    Smartphone, HelpCircle, RotateCcw, Truck, FileText
} from 'lucide-react';

interface FooterProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function DefaultFooter({ title }: FooterProps) {
    const { storeName, logoUrl, settings, ecommerceData } = useStoreSettings();
    const { data: categoriesData } = useGet<ApiResponse<Category>>(['categories'], '/category');
    const categories = (categoriesData?.data?.data || []).slice(0, 5);

    const currentYear = new Date().getFullYear();
    const ecomData = ecommerceData?.[0] || settings?.ecommerceData?.[0];
    const footerLogo = ecomData?.footer?.logo || logoUrl;
    const footerBio = ecomData?.footer?.bio || "Your premier destination for modern lifestyle, curated essentials, and authentic products with nationwide express delivery.";
    const socialLinks = ecomData?.social_links || {};

    return (
        <footer className="w-full bg-white border-t border-gray-100 mt-20 pt-16 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 1. Main Columns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-gray-100">
                    {/* Brand Info & App download */}
                    <div className="lg:col-span-4 flex flex-col items-start gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            {footerLogo ? (
                                <img src={footerLogo} alt={storeName} className="h-10 max-w-[180px] object-contain" />
                            ) : (
                                <span className="text-2xl font-black tracking-tighter text-primary">
                                    {storeName || 'STORE'}<span className="text-secondary">.</span>
                                </span>
                            )}
                        </Link>

                        <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                            {footerBio}
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-2.5 pt-1">
                            {socialLinks.instagram && (
                                <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-secondary hover:text-white flex items-center justify-center text-gray-600 transition-colors shadow-xs">
                                    <Instagram size={16} />
                                </a>
                            )}
                            {socialLinks.facebook && (
                                <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-secondary hover:text-white flex items-center justify-center text-gray-600 transition-colors shadow-xs">
                                    <Facebook size={16} />
                                </a>
                            )}
                            {socialLinks.twitter && (
                                <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-secondary hover:text-white flex items-center justify-center text-gray-600 transition-colors shadow-xs">
                                    <Twitter size={16} />
                                </a>
                            )}
                            {socialLinks.youtube && (
                                <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-secondary hover:text-white flex items-center justify-center text-gray-600 transition-colors shadow-xs">
                                    <Youtube size={16} />
                                </a>
                            )}
                        </div>

                        {/* Mobile App Download Badges */}
                        <div className="pt-3">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                Download Mobile App
                            </span>
                            <div className="flex items-center gap-2">
                                <a href="#" className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-[11px] font-bold">
                                    <Smartphone size={14} />
                                    <span>App Store</span>
                                </a>
                                <a href="#" className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-[11px] font-bold">
                                    <Smartphone size={14} />
                                    <span>Google Play</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Categories Links */}
                    <div className="lg:col-span-3">
                        <h4 className="text-sm font-black uppercase tracking-wider text-primary mb-4">
                            Categories
                        </h4>
                        <ul className="flex flex-col gap-2.5 text-sm text-gray-600">
                            {categories.map((cat) => (
                                <li key={cat._id}>
                                    <Link
                                        href={`/categories?id=${cat._id}`}
                                        className="hover:text-secondary transition-colors"
                                    >
                                        {cat.name || cat.ar_name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href="/categories" className="text-secondary font-bold hover:underline inline-flex items-center gap-1">
                                    View All Categories &rarr;
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Support & Policies */}
                    <div className="lg:col-span-2">
                        <h4 className="text-sm font-black uppercase tracking-wider text-primary mb-4">
                            Customer Care
                        </h4>
                        <ul className="flex flex-col gap-2.5 text-sm text-gray-600">
                            <li><Link href="/order-tracking" className="hover:text-secondary transition-colors">Track Your Order</Link></li>
                            <li><Link href="/categories" className="hover:text-secondary transition-colors">Shipping & Delivery</Link></li>
                            <li><Link href="/favourite" className="hover:text-secondary transition-colors">Wishlist & Favorites</Link></li>
                            <li><Link href="/cart" className="hover:text-secondary transition-colors">Cart & Checkout</Link></li>
                            <li><a href="#" className="hover:text-secondary transition-colors">14-Day Returns Policy</a></li>
                            <li><a href="#" className="hover:text-secondary transition-colors">Help Center & FAQs</a></li>
                        </ul>
                    </div>

                    {/* Contact Info & Hours */}
                    <div className="lg:col-span-3 flex flex-col gap-3">
                        <h4 className="text-sm font-black uppercase tracking-wider text-primary mb-2">
                            Store Contact
                        </h4>
                        {ecomData?.address && (
                            <div className="flex items-start gap-2.5 text-sm text-gray-600">
                                <MapPin size={18} className="text-secondary shrink-0 mt-0.5" />
                                <span>{ecomData.address}</span>
                            </div>
                        )}
                        {ecomData?.phone && (
                            <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                <Phone size={18} className="text-secondary shrink-0" />
                                <a href={`tel:${ecomData.phone}`} className="hover:text-secondary">{ecomData.phone}</a>
                            </div>
                        )}
                        {ecomData?.email && (
                            <div className="flex items-center gap-2.5 text-sm text-gray-600">
                                <Mail size={18} className="text-secondary shrink-0" />
                                <a href={`mailto:${ecomData.email}`} className="hover:text-secondary">{ecomData.email}</a>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Payment Methods Badges Row */}
                <div className="py-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                        <CreditCard size={16} className="text-secondary" />
                        <span>Accepted Payment Methods:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {['Visa', 'MasterCard', 'Meeza', 'Apple Pay', 'Cash on Delivery'].map((method) => (
                            <span
                                key={method}
                                className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-700 border border-gray-200/80 shadow-xs"
                            >
                                {method}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 3. Bottom Copyright & Security */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                    <p className="flex items-center gap-1">
                        &copy; {currentYear} {storeName || 'Store'}. All rights reserved.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-gray-500 font-medium">
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                            <ShieldCheck size={14} /> 256-Bit SSL Secured
                        </span>
                        <span>&bull;</span>
                        <a href="#" className="hover:underline">Privacy Policy</a>
                        <span>&bull;</span>
                        <a href="#" className="hover:underline">Terms & Conditions</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
