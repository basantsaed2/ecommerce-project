"use client";

import React, { useState } from 'react';
import { Product } from '@/types/api';
import { FileText, Sliders, Truck, RefreshCcw, ShieldCheck, Box } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductTabsInfoProps {
    product: Product;
    skuCode?: string;
}

export default function ProductTabsInfo({ product, skuCode }: ProductTabsInfoProps) {
    const { t, getLocalized } = useTranslation();
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping' | 'warranty'>('description');

    return (
        <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm mt-8">
            {/* Tabs Header */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                <button
                    onClick={() => setActiveTab('description')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'description'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                    }`}
                >
                    <FileText size={16} />
                    {t.product.description}
                </button>

                <button
                    onClick={() => setActiveTab('specs')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'specs'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                    }`}
                >
                    <Sliders size={16} />
                    {t.sections.specifications}
                </button>

                <button
                    onClick={() => setActiveTab('shipping')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'shipping'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                    }`}
                >
                    <Truck size={16} />
                    {t.sections.shippingDelivery}
                </button>

                <button
                    onClick={() => setActiveTab('warranty')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                        activeTab === 'warranty'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                    }`}
                >
                    <ShieldCheck size={16} />
                    {t.sections.returnsGuarantee}
                </button>
            </div>

            {/* Tab Content */}
            <div className="text-sm text-gray-600 leading-relaxed">
                {activeTab === 'description' && (
                    <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">
                            {getLocalized(product, 'description') || t.sections.detailedDescriptionSoon}
                        </p>
                        {product.ar_description && product.description !== product.ar_description && (
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-4 text-right" dir="rtl">
                                <h4 className="font-bold text-gray-800 mb-1">{t.sections.arabicDescription}</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">{product.ar_description}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'specs' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl">
                            <span className="text-gray-400 font-medium">{t.sections.itemCode}</span>
                            <span className="font-bold text-primary">{skuCode || product._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl">
                            <span className="text-gray-400 font-medium">{t.product.brand}</span>
                            <span className="font-bold text-primary">{product.brand ? getLocalized(product.brand) : t.sections.authorizedBrand}</span>
                        </div>
                        <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl">
                            <span className="text-gray-400 font-medium">{t.product.category}</span>
                            <span className="font-bold text-primary">{product.category ? getLocalized(product.category) : t.sections.generalCollection}</span>
                        </div>
                        <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl">
                            <span className="text-gray-400 font-medium">{t.sections.condition}</span>
                            <span className="font-bold text-emerald-600">{t.sections.brandNew}</span>
                        </div>
                    </div>
                )}

                {activeTab === 'shipping' && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
                            <Truck className="text-secondary shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-primary text-sm mb-1">{t.sections.standardDelivery}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {t.sections.standardDeliveryDesc}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <Box className="text-gray-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-primary text-sm mb-1">{t.sections.carefulPackaging}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {t.sections.carefulPackagingDesc}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'warranty' && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <RefreshCcw className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-emerald-950 text-sm mb-1">{t.sections.moneyBack}</h4>
                                <p className="text-xs text-emerald-800 leading-relaxed">
                                    {t.sections.moneyBackDesc}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-primary text-sm mb-1">{t.sections.authenticity}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {t.sections.authenticityDesc}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
