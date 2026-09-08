"use client";
import React, { useState, useEffect } from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Banner } from '@/types/api';
import { Loader2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import DynamicBanner from '@/components/common/DynamicBanner';
import Link from 'next/link';

const FALLBACK_BANNERS = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
        title: "Summer Sale Collection",
        subtitle: "NEW SEASON EXCLUSIVES",
        badge: "Up to 50% OFF"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        title: "Trending Fashion & Style",
        subtitle: "CURATED FOR YOU",
        badge: "Special Offers"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=2070&auto=format&fit=crop",
        title: "Premium Luxury Accessories",
        subtitle: "BEST QUALITY GUARANTEED",
        badge: "New Arrival"
    }
];

interface HeroProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function DefaultHero({ title, subtitle }: HeroProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { data: bannersData, isLoading } = useGet<ApiResponse<Banner>>(['banners'], '/banner');
    
    const bannersList = bannersData?.data?.data || [];
    const homeBanner = bannersList.find(b => b.name?.includes('home')) || bannersList[0];
    
    const displayImages = homeBanner && homeBanner.images?.length > 0 
        ? homeBanner.images 
        : FALLBACK_BANNERS.map(b => b.image);

    // Auto-scroll logic
    useEffect(() => {
        if (displayImages.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [displayImages.length]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    };

    if (isLoading) {
        return (
            <section className="w-full py-4">
                <div className="w-full h-[280px] md:h-[480px] lg:h-[560px] relative rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center bg-gray-100">
                    <Loader2 className="animate-spin text-secondary" size={48} />
                </div>
            </section>
        );
    }

    return (
        <section className="w-full py-3 relative">
            <div className="w-full h-[300px] sm:h-[380px] md:h-[480px] lg:h-[560px] relative rounded-3xl overflow-hidden shadow-2xl group">
                {displayImages.map((image, index) => {
                    const fallbackData = FALLBACK_BANNERS[index] || FALLBACK_BANNERS[0];
                    const displayTitle = title || homeBanner?.title || fallbackData.title;
                    const displaySubtitle = subtitle || homeBanner?.description || fallbackData.subtitle;

                    return (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                            }`}
                        >
                            {/* Background Image */}
                            <DynamicBanner
                                pageName="home"
                                fallbackImage={fallbackData.image || image}
                                imageIndex={index}
                                alt={`Hero Slide ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            />
                            
                            {/* Overlay and Text */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 flex items-end p-6 sm:p-10 md:p-16">
                                <div className="max-w-3xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 text-white">
                                    <span className="text-secondary font-black tracking-widest text-xs md:text-sm bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 mb-3 md:mb-4 inline-block uppercase">
                                        {displaySubtitle}
                                    </span>
                                    
                                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-lg mb-4">
                                        {displayTitle}
                                    </h1>

                                    <div className="flex items-center gap-4">
                                        <Link 
                                            href="/categories" 
                                            className="bg-secondary text-white px-6 py-2.5 md:px-8 md:py-3.5 text-sm md:text-base rounded-2xl font-bold hover:brightness-110 active:scale-95 transition-all duration-300 shadow-xl shadow-secondary/30 flex items-center gap-2"
                                        >
                                            Shop Now
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Left/Right Slide Arrows */}
                {displayImages.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            aria-label="Previous slide"
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-black shadow-lg"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={handleNext}
                            aria-label="Next slide"
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-black shadow-lg"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Slide Indicators */}
                {displayImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {displayImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    idx === currentIndex ? "w-8 bg-secondary" : "w-2 bg-white/50 hover:bg-white"
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
