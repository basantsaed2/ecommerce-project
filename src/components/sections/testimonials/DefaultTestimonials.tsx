"use client";
import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

interface TestimonialsProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

const REVIEWS = [
    {
        id: 1,
        name: "Sarah Jenkins",
        role: "Verified Buyer",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        rating: 5,
        review: "The quality of the products completely exceeded my expectations. Fast delivery and stunning packaging. Will definitely order again!"
    },
    {
        id: 2,
        name: "Ahmed Mansour",
        role: "Verified Buyer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        rating: 5,
        review: "Super smooth checkout and the customer support was extremely helpful when I needed to adjust my order details. 10/10 service!"
    },
    {
        id: 3,
        name: "Elena Rostova",
        role: "Verified Buyer",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        rating: 5,
        review: "Authentic materials and great prices compared to other stores. I love the clean design and easy navigation of this website."
    }
];

export default function DefaultTestimonials({
    title,
    subtitle
}: TestimonialsProps) {
    return (
        <section className="w-full py-12">
            <div className="flex flex-col items-center text-center mb-10 px-4">
                <span className="text-xs font-black uppercase tracking-widest text-secondary mb-2 block">
                    {subtitle || "Social Proof"}
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                    {title || "Loved by Thousands of Customers"}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {REVIEWS.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white/90 backdrop-blur-md rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    >
                        <div>
                            {/* Stars */}
                            <div className="flex items-center gap-1 text-amber-400 mb-4">
                                {[...Array(item.rating)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" />
                                ))}
                            </div>

                            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6 italic">
                                &quot;{item.review}&quot;
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                            <img
                                src={item.avatar}
                                alt={item.name}
                                className="w-11 h-11 rounded-full object-cover border-2 border-secondary/30"
                            />
                            <div>
                                <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                                    {item.name}
                                    <CheckCircle2 size={14} className="text-secondary" />
                                </h4>
                                <span className="text-xs text-gray-400">{item.role}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
