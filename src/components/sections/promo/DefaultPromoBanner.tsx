"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Timer, ArrowRight } from 'lucide-react';

interface PromoBannerProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function DefaultPromoBanner({
    title,
    subtitle
}: PromoBannerProps) {
    // 24-hour countdown simulation
    const [timeLeft, setTimeLeft] = useState({
        hours: 14,
        minutes: 45,
        seconds: 30,
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <section className="w-full py-8">
            <div
                className="relative rounded-[2.5rem] p-8 sm:p-12 md:p-14 text-white overflow-hidden shadow-2xl shadow-primary/20"
                style={{
                    background: 'linear-gradient(105deg, color-mix(in srgb, var(--color-primary) 82%, #000000), color-mix(in srgb, var(--color-secondary) 68%, #000000))',
                }}
            >
                {/* Background Glass Shapes */}
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-secondary/20 rounded-full blur-2xl" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-8 flex flex-col items-start gap-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-black tracking-wider uppercase border border-white/20">
                            <Sparkles size={14} className="text-secondary" />
                            {subtitle || "Limited Time Deal"}
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            {title || "Special Flash Sale — Get Up to 40% OFF Today!"}
                        </h2>

                        <p className="text-gray-200 text-sm sm:text-base max-w-xl font-medium">
                            Don&apos;t miss out on our best-selling collections. Apply promo code <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">STORE2026</span> at checkout.
                        </p>

                        <div className="flex items-center gap-4 pt-2">
                            <Link
                                href="/categories"
                                className="bg-white text-primary hover:bg-secondary hover:text-white px-7 py-3 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg transition-all active:scale-95 duration-300"
                            >
                                Shop Special Deals
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* Countdown Box */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-secondary mb-4">
                            <Timer size={16} />
                            <span>Offer Ends In</span>
                        </div>

                        <div className="flex items-center gap-3 text-center">
                            <div className="bg-black/30 backdrop-blur-md px-4 py-3 rounded-2xl min-w-[65px] border border-white/10">
                                <span className="text-2xl sm:text-3xl font-black block">
                                    {String(timeLeft.hours).padStart(2, '0')}
                                </span>
                                <span className="text-[10px] text-gray-300 uppercase font-semibold">Hours</span>
                            </div>
                            <span className="text-2xl font-bold text-white/60">:</span>
                            <div className="bg-black/30 backdrop-blur-md px-4 py-3 rounded-2xl min-w-[65px] border border-white/10">
                                <span className="text-2xl sm:text-3xl font-black block">
                                    {String(timeLeft.minutes).padStart(2, '0')}
                                </span>
                                <span className="text-[10px] text-gray-300 uppercase font-semibold">Mins</span>
                            </div>
                            <span className="text-2xl font-bold text-white/60">:</span>
                            <div className="bg-black/30 backdrop-blur-md px-4 py-3 rounded-2xl min-w-[65px] border border-white/10">
                                <span className="text-2xl sm:text-3xl font-black block text-secondary">
                                    {String(timeLeft.seconds).padStart(2, '0')}
                                </span>
                                <span className="text-[10px] text-gray-300 uppercase font-semibold">Secs</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
