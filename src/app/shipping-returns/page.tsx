"use client";

import Link from "next/link";
import { RotateCcw, Truck } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function ShippingReturnsPage() {
    const { t, isRtl } = useTranslation();

    return (
        <main className="min-h-[70vh] bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <h1 className={`mb-10 text-3xl font-black text-primary sm:text-4xl ${isRtl ? "text-right" : "text-left"}`}>
                    {t.sections.shippingReturns}
                </h1>

                <div className="grid gap-6 md:grid-cols-2">
                    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                        <Truck className="mb-5 text-secondary" size={32} aria-hidden="true" />
                        <h2 className="mb-3 text-xl font-bold text-gray-900">{t.sections.faqShippingQuestion}</h2>
                        <p className="leading-7 text-gray-600">{t.sections.faqShippingAnswer}</p>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                        <RotateCcw className="mb-5 text-secondary" size={32} aria-hidden="true" />
                        <h2 className="mb-3 text-xl font-bold text-gray-900">{t.sections.faqReturnsQuestion}</h2>
                        <p className="leading-7 text-gray-600">{t.sections.faqReturnsAnswer}</p>
                    </section>
                </div>

                <Link
                    href="/products"
                    className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-white transition hover:opacity-90"
                >
                    {t.sections.allProducts}
                </Link>
            </div>
        </main>
    );
}
