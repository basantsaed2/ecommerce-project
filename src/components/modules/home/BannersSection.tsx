"use client";
import React, { useState, useEffect } from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Banner } from '@/types/api';
import { Loader2 } from 'lucide-react';
import DynamicBanner from '@/components/common/DynamicBanner';

const BANNERS = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
        title: "Summer Sale",
        subtitle: "NEW COLLECTION"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        title: "Women's Fashion",
        subtitle: "UP TO 50% OFF"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=2070&auto=format&fit=crop", // Updated image
        title: "Accessories",
        subtitle: "TRENDING NOW"
    }
];

export default function BannersSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { data: bannersData, isLoading } = useGet<ApiResponse<Banner>>(['banners'], '/banner');
    
    const bannersList = bannersData?.data?.data || [];
    const homeBanner = bannersList.find(b => b.name.includes('home'));
    
    // Fallback to static data if no api data is found
    const displayImages = homeBanner && homeBanner.images.length > 0 
        ? homeBanner.images 
        : BANNERS.map(b => b.image);

    // Auto-scroll logic
    useEffect(() => {
        if (displayImages.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
        }, 4000); // Changes every 4 seconds

        return () => clearInterval(interval);
    }, [displayImages.length]);

    if (isLoading) {
        return (
            <section className="w-full px-4 py-6">
                <div className="w-full h-[250px] md:h-[450px] lg:h-[550px] relative rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center bg-gray-50">
                    <Loader2 className="animate-spin text-secondary" size={48} />
                </div>
            </section>
        );
    }

    return (
        <section className="w-full px-4 py-6">
            <div className="w-full h-[250px] md:h-[450px] lg:h-[550px] relative rounded-3xl overflow-hidden shadow-2xl group">
                {displayImages.map((image, index) => {
                    const fallbackData = BANNERS[index] || { title: "", subtitle: "" };
                    const displayTitle = homeBanner?.title || fallbackData.title;
                    const displaySubtitle = homeBanner?.description || fallbackData.subtitle;

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
                            alt={`Banner ${index}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                        
                        {/* Overlay and Text */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 pb-12 md:p-16">
                            <div className="max-w-3xl transform translate-y-2 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                {displaySubtitle && (
                                    <span className="text-secondary font-black tracking-widest text-[10px] md:text-sm bg-white/10 px-3 py-1 md:px-4 md:py-1.5 rounded-full backdrop-blur-md border border-white/20 mb-2 md:mb-4 inline-block uppercase">
                                        {displaySubtitle}
                                    </span>
                                )}
                                {displayTitle && (
                                    <h2 className="text-white text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight drop-shadow-xl">
                                        {displayTitle}
                                    </h2>
                                )}
                                <button className="mt-3 md:mt-6 bg-secondary text-white px-5 py-2 md:px-8 md:py-3 text-sm md:text-base rounded-xl md:rounded-2xl font-bold hover:bg-white hover:text-black transition-colors duration-300 shadow-lg shadow-secondary/30">
                                    Shop Now
                                </button>
                            </div>
                        </div>
                    </div>
                )})}

                {/* Slider Navigation Dots */}
                {displayImages.length > 1 && (
                    <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
                        {displayImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`transition-all duration-300 rounded-full h-2 ${
                                    index === currentIndex ? "w-8 bg-secondary" : "w-2 bg-white/50 hover:bg-white"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
