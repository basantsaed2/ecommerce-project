'use client';

import Link from 'next/link';
import {
    ArrowRight,
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Send,
    Twitter,
    Youtube,
} from 'lucide-react';
import { useStoreSettings } from '@/hooks/useStoreSettings';

const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    linkedin: Linkedin,
};

export default function AboutPage() {
    const { settings, storeName, logoUrl } = useStoreSettings();
    const ecommerceData = settings.ecommerceData?.[0];
    const header = ecommerceData?.header;
    const footer = ecommerceData?.footer;
    const socialLinks = ecommerceData?.social_links || {};
    const aboutText = footer?.bio || ecommerceData?.bio ||
        'We bring carefully selected products together with a simple, reliable shopping experience.';
    const contactItems = [
        ecommerceData?.address ? { icon: MapPin, label: 'Address', value: ecommerceData.address } : null,
        ecommerceData?.email ? { icon: Mail, label: 'Email', value: ecommerceData.email, href: `mailto:${ecommerceData.email}` } : null,
        ecommerceData?.phone ? { icon: Phone, label: 'Phone', value: ecommerceData.phone, href: `tel:${ecommerceData.phone}` } : null,
    ].filter(Boolean) as Array<{
        icon: typeof MapPin;
        label: string;
        value: string;
        href?: string;
    }>;
    const activeSocialLinks = Object.entries(socialLinks).filter(
        ([key, value]) => key in socialIcons && Boolean(value),
    ) as Array<[keyof typeof socialIcons, string]>;

    return (
        <main className="min-h-screen bg-gray-50/70 text-gray-900">
            <section className="relative overflow-hidden bg-primary text-white">
                <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
                <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
                    <div className="max-w-3xl">
                        <p className="mb-5 text-xs font-black uppercase tracking-[0.3em] text-secondary">
                            About {storeName || 'our store'}
                        </p>
                        <h1 className="text-4xl font-black tracking-tight md:text-7xl">
                            {header?.title || storeName || 'Our Store'}
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
                            {aboutText}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:px-10 md:py-20 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/40 md:p-12">
                    <div className="mb-8 flex items-center gap-4">
                        {footer?.logo || logoUrl ? (
                            <img
                                src={footer?.logo || logoUrl || undefined}
                                alt={storeName || 'Store logo'}
                                className="h-14 max-w-[220px] object-contain"
                            />
                        ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-black text-white">
                                {(storeName || 'S').charAt(0)}
                            </div>
                        )}
                    </div>
                    <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-secondary">
                        Our story
                    </p>
                    <h2 className="max-w-xl text-3xl font-black tracking-tight text-primary md:text-5xl">
                        Thoughtful shopping, made for everyday life.
                    </h2>
                    <p className="mt-6 max-w-2xl text-base leading-8 text-gray-500">
                        {aboutText}
                    </p>
                    <Link
                        href="/product"
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        Explore products
                        <ArrowRight size={17} />
                    </Link>
                </div>

                <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-gray-200/40 md:p-10">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-secondary">
                        Get in touch
                    </p>
                    <h2 className="text-3xl font-black tracking-tight text-primary">We are here to help.</h2>
                    <div className="mt-8 space-y-4">
                        {contactItems.length > 0 ? contactItems.map(({ icon: Icon, label, value, href }) => (
                            <div key={label} className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                                    <Icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">{label}</p>
                                    {href ? (
                                        <a href={href} className="mt-1 block break-words text-sm font-bold text-primary hover:text-secondary">
                                            {value}
                                        </a>
                                    ) : (
                                        <p className="mt-1 text-sm font-bold text-primary">{value}</p>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <p className="rounded-2xl bg-gray-50 p-5 text-sm leading-7 text-gray-500">
                                Contact details will appear here once they are added to the store settings.
                            </p>
                        )}
                    </div>

                    {activeSocialLinks.length > 0 && (
                        <div className="mt-8 border-t border-gray-100 pt-6">
                            <p className="mb-4 text-xs font-black uppercase tracking-wider text-gray-400">Follow us</p>
                            <div className="flex flex-wrap gap-3">
                                {activeSocialLinks.map(([key, href]) => {
                                    const Icon = socialIcons[key];
                                    return (
                                        <a
                                            key={key}
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={key}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition hover:bg-secondary hover:text-white"
                                        >
                                            <Icon size={17} />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-20 md:px-10">
                <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-secondary/10 p-8 md:flex-row md:items-center md:p-10">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-secondary">Keep exploring</p>
                        <h2 className="mt-2 text-2xl font-black text-primary md:text-3xl">Find something you will love.</h2>
                    </div>
                    <Link href="/categories" className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-white transition hover:shadow-lg">
                        Browse categories
                        <Send size={16} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
