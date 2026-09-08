"use client";
import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones, CreditCard, Award } from 'lucide-react';

interface FeaturesProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function DefaultFeatures({ title, subtitle }: FeaturesProps) {
    const features = [
        {
            icon: Truck,
            title: "Free Fast Shipping",
            description: "On all orders above $50",
            badge: "Fast"
        },
        {
            icon: ShieldCheck,
            title: "100% Secure Payment",
            description: "Encrypted & safe checkout",
            badge: "Secure"
        },
        {
            icon: RefreshCw,
            title: "14 Days Free Returns",
            description: "Hassle-free money back",
            badge: "Easy"
        },
        {
            icon: Headphones,
            title: "24/7 Expert Support",
            description: "Dedicated live assistance",
            badge: "Online"
        },
    ];

    return (
        <section className="w-full py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                        <div
                            key={idx}
                            className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100/80 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 group flex items-start gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors duration-300 shrink-0">
                                <Icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-primary mb-1 group-hover:text-secondary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
