"use client";

import React from 'react';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';
import { StoreSection } from '@/types/storeSettings';

// Section Components
import DefaultHero from './hero/DefaultHero';
import ModernHero from './hero/ModernHero';
import MinimalHero from './hero/MinimalHero';

import DefaultFeatures from './features/DefaultFeatures';

import DefaultCategories from './categories/DefaultCategories';
import ModernCategories from './categories/ModernCategories';
import MinimalCategories from './categories/MinimalCategories';

import DefaultProducts from './products/DefaultProducts';
import ModernProducts from './products/ModernProducts';
import MinimalProducts from './products/MinimalProducts';

import DefaultPromoBanner from './promo/DefaultPromoBanner';
import PromotionalBanners from './promo/PromotionalBanners';

import DefaultBrands from './brands/DefaultBrands';
import DefaultTestimonials from './testimonials/DefaultTestimonials';
import InstagramFeed from './social/InstagramFeed';
import ShoppingGuides from './blog/ShoppingGuides';
import FAQSection from './faq/FAQSection';
import DefaultNewsletter from './newsletter/DefaultNewsletter';

import DefaultFooter from './footer/DefaultFooter';
import ModernFooter from './footer/ModernFooter';

interface DynamicSectionRendererProps {
    sections?: StoreSection[];
    searchQuery?: string;
    excludeKeys?: string[];
    className?: string;
}

export default function DynamicSectionRenderer({
    sections: propSections,
    searchQuery = "",
    excludeKeys = [],
    className = "",
}: DynamicSectionRendererProps) {
    const { sections: contextSections, templateSlug: globalTemplateSlug } = useStoreSettings();

    const sectionsToRender = propSections || contextSections || [];

    // Filter enabled sections and exclude any specified keys
    const enabledSections = sectionsToRender
        .filter((sec) => sec && sec.enabled !== false && !excludeKeys.includes(sec.key))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const renderSection = (section: StoreSection, index: number) => {
        const slug = section.templateSlug || globalTemplateSlug || 'default';
        const sectionType = section.key?.toLowerCase();
        
        // فصل الـ key عن بقية الـ props
        const componentKey = `${section.key}-${index}`;
        const sectionProps = {
            title: section.title,
            subtitle: section.subtitle,
            config: section.config,
            searchQuery,
        };

        switch (sectionType) {
            case 'hero':
            case 'banners':
            case 'banner':
            case 'hero-banner':
                if (slug === 'modern-shop') return <ModernHero key={componentKey} {...sectionProps} />;
                if (slug === 'minimal') return <MinimalHero key={componentKey} {...sectionProps} />;
                return <DefaultHero key={componentKey} {...sectionProps} />;

            case 'features':
            case 'perks':
            case 'trust-badges':
            case 'value-propositions':
                return <DefaultFeatures key={componentKey} {...sectionProps} />;

            case 'categories':
            case 'category':
            case 'category-grid':
                if (slug === 'modern-shop') return <ModernCategories key={componentKey} {...sectionProps} />;
                if (slug === 'minimal') return <MinimalCategories key={componentKey} {...sectionProps} />;
                return <DefaultCategories key={componentKey} {...sectionProps} />;

            case 'products':
            case 'featured-products':
            case 'featured':
            case 'product':
                if (slug === 'modern-shop') return <ModernProducts key={componentKey} {...sectionProps} />;
                if (slug === 'minimal') return <MinimalProducts key={componentKey} {...sectionProps} />;
                return <DefaultProducts key={componentKey} {...sectionProps} />;

            case 'best-sellers':
            case 'bestsellers':
                return <ModernProducts key={componentKey} {...sectionProps} title={section.title || "Best Selling Products"} />;

            case 'new-arrivals':
            case 'newarrivals':
                return <DefaultProducts key={componentKey} {...sectionProps} title={section.title || "New Arrivals"} />;

            case 'promo-banner':
            case 'special-offers':
            case 'promo':
            case 'offer':
            case 'flash-sale':
            case 'deals-of-the-day':
                return <DefaultPromoBanner key={componentKey} {...sectionProps} />;

            case 'promotional-banners':
            case 'sub-banners':
            case 'promo-grid':
                return <PromotionalBanners key={componentKey} {...sectionProps} />;

            case 'brands':
            case 'brand':
            case 'brand-logos':
            case 'partners':
                return <DefaultBrands key={componentKey} {...sectionProps} />;

            case 'testimonials':
            case 'reviews':
            case 'customer-reviews':
                return <DefaultTestimonials key={componentKey} {...sectionProps} />;

            case 'instagram-feed':
            case 'social-proof':
            case 'ugc':
                return <InstagramFeed key={componentKey} {...sectionProps} />;

            case 'shopping-guides':
            case 'blog-guides':
            case 'blog':
            case 'guides':
                return <ShoppingGuides key={componentKey} {...sectionProps} />;

            case 'faq':
            case 'faqs':
                return <FAQSection key={componentKey} {...sectionProps} />;

            case 'newsletter':
            case 'subscribe':
                return <DefaultNewsletter key={componentKey} {...sectionProps} />;

            case 'footer':
                if (slug === 'modern-shop') return <ModernFooter key={componentKey} {...sectionProps} />;
                return <DefaultFooter key={componentKey} {...sectionProps} />;

            default:
                return null;
        }
    };

    return (
        <div className={`w-full flex flex-col gap-6 ${className}`}>
            {enabledSections.map((section, idx) => renderSection(section, idx))}
        </div>
    );
}