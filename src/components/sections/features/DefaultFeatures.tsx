"use client";
import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface FeaturesProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function DefaultFeatures({ title, subtitle }: FeaturesProps) {
    const { t } = useTranslation();
    const features = [
        {
            icon: Truck,
            title: t.home.fastDelivery,
            description: t.home.fastDeliveryDesc,
            badge: t.home.fastDelivery
        },
        {
            icon: ShieldCheck,
            title: t.home.securePayment,
            description: t.home.securePaymentDesc,
            badge: t.home.securePayment
        },
        {
            icon: RefreshCw,
            title: t.home.easyReturns,
            description: t.home.easyReturnsDesc,
            badge: t.home.easyReturns
        },
        {
            icon: Headphones,
            title: t.home.support247,
            description: t.home.support247Desc,
            badge: t.home.support247
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
