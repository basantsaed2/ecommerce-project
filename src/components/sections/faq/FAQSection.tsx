"use client";

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface FAQItem {
    id: number;
    questionKey: 'faqShippingQuestion' | 'faqReturnsQuestion' | 'faqPaymentQuestion' | 'faqTrackingQuestion' | 'faqAuthenticityQuestion';
    answerKey: 'faqShippingAnswer' | 'faqReturnsAnswer' | 'faqPaymentAnswer' | 'faqTrackingAnswer' | 'faqAuthenticityAnswer';
}

const FAQS: FAQItem[] = [
    {
        id: 1,
        questionKey: 'faqShippingQuestion',
        answerKey: 'faqShippingAnswer'
    },
    {
        id: 2,
        questionKey: 'faqReturnsQuestion',
        answerKey: 'faqReturnsAnswer'
    },
    {
        id: 3,
        questionKey: 'faqPaymentQuestion',
        answerKey: 'faqPaymentAnswer'
    },
    {
        id: 4,
        questionKey: 'faqTrackingQuestion',
        answerKey: 'faqTrackingAnswer'
    },
    {
        id: 5,
        questionKey: 'faqAuthenticityQuestion',
        answerKey: 'faqAuthenticityAnswer'
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
    const { t } = useTranslation();
    const [openId, setOpenId] = useState<number | null>(1);

    const toggle = (id: number) => {
        setOpenId(prev => (prev === id ? null : id));
    };

    return (
        <section className="w-full py-10 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8 px-4">
                <span className="text-xs font-black uppercase tracking-widest text-secondary mb-1 flex items-center gap-1.5">
                    <HelpCircle size={14} />
                    {subtitle || t.sections.gotQuestions}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary tracking-tight">
                    {title || t.sections.frequentlyAskedQuestions}
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
                                    {t.sections[faq.questionKey]}
                                </span>
                                <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-secondary/10 text-secondary' : ''}`}>
                                    <ChevronDown size={18} />
                                </div>
                            </button>

                            {isOpen && (
                                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 animate-fadeIn">
                                    {t.sections[faq.answerKey]}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
