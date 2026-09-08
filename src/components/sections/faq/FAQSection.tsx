"use client";

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

const FAQS: FAQItem[] = [
    {
        id: 1,
        question: "How fast is standard and express shipping?",
        answer: "Standard delivery takes between 2 to 4 business days. Express next-day shipping is available in selected major metropolitan areas for orders placed before 3:00 PM."
    },
    {
        id: 2,
        question: "What is your return & exchange policy?",
        answer: "We offer a 14-day hassle-free return and exchange guarantee on all unwashed, unworn items in their original packaging with tags attached."
    },
    {
        id: 3,
        question: "What payment methods do you accept?",
        answer: "We accept Visa, MasterCard, Meeza, Apple Pay, and Cash on Delivery (COD) across all supported governorates."
    },
    {
        id: 4,
        question: "How can I track my shipment order?",
        answer: "Once your order is dispatched, you will receive an SMS and email with a live tracking code. You can also visit our 'Track Order' page directly."
    },
    {
        id: 5,
        question: "Are all products 100% genuine and authentic?",
        answer: "Yes, 100% of our products are sourced directly from authorized brand distributors and manufactured with strict quality standards."
    }
];

interface FAQSectionProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function FAQSection({
    title,
    subtitle
}: FAQSectionProps) {
    const [openId, setOpenId] = useState<number | null>(1);

    const toggle = (id: number) => {
        setOpenId(prev => (prev === id ? null : id));
    };

    return (
        <section className="w-full py-10 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8 px-4">
                <span className="text-xs font-black uppercase tracking-widest text-secondary mb-1 flex items-center gap-1.5">
                    <HelpCircle size={14} />
                    {subtitle || "Got Questions?"}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tracking-tight">
                    {title || "Frequently Asked Questions"}
                </h2>
            </div>

            <div className="flex flex-col gap-3">
                {FAQS.map((faq) => {
                    const isOpen = openId === faq.id;
                    return (
                        <div
                            key={faq.id}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs transition-all duration-200"
                        >
                            <button
                                onClick={() => toggle(faq.id)}
                                className="w-full flex items-center justify-between p-5 text-left gap-4 hover:bg-gray-50/50 transition-colors"
                            >
                                <span className="text-sm sm:text-base font-bold text-primary">
                                    {faq.question}
                                </span>
                                <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-secondary/10 text-secondary' : ''}`}>
                                    <ChevronDown size={18} />
                                </div>
                            </button>

                            {isOpen && (
                                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 animate-fadeIn">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
