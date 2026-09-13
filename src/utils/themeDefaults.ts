import { StoreSettings, StoreSection, StoreColors } from '@/types/storeSettings';

export const DEFAULT_STORE_SECTIONS: StoreSection[] = [
    {
        key: 'hero',
        enabled: true,
        order: 1,
        title: 'Hero Banner',
    },
    {
        key: 'features',
        enabled: true,
        order: 2,
        title: 'Store Perks & Trust Badges',
    },
    {
        key: 'categories',
        enabled: true,
        order: 3,
        title: 'Shop by Category',
    },
    {
        key: 'promotional-banners',
        enabled: true,
        order: 4,
        title: 'Special Collections',
    },
    {
        key: 'products',
        enabled: true,
        order: 5,
        title: 'Trending & Best Sellers',
    },
    {
        key: 'promo-banner',
        enabled: true,
        order: 6,
        title: 'Flash Sale & Limited Deals',
    },
    {
        key: 'brands',
        enabled: true,
        order: 7,
        title: 'Featured Brands',
    },
    {
        key: 'testimonials',
        enabled: true,
        order: 8,
        title: 'Customer Reviews & Social Proof',
    },
    {
        key: 'instagram-feed',
        enabled: true,
        order: 9,
        title: 'Shop the Look #UGC',
    },
    {
        key: 'shopping-guides',
        enabled: true,
        order: 10,
        title: 'Shopping Guides & Style Tips',
    },
    {
        key: 'faq',
        enabled: true,
        order: 11,
        title: 'Frequently Asked Questions',
    },
    {
        key: 'newsletter',
        enabled: true,
        order: 12,
        title: 'Newsletter Subscription',
    },
    {
        key: 'footer',
        enabled: true,
        order: 13,
        title: 'Footer',
    },
];

export const EXAMPLE_STORE_SECTIONS: StoreSection[] = [
    {
        key: 'hero',
        enabled: true,
        order: 1,
        title: 'Example Hero Banner',
        templateSlug: 'example',
    },
    {
        key: 'features',
        enabled: true,
        order: 2,
        title: 'Why Choose Us',
        templateSlug: 'example',
    },
    {
        key: 'categories',
        enabled: true,
        order: 3,
        title: 'Shop Categories',
        templateSlug: 'example',
    },
    {
        key: 'footer',
        enabled: true,
        order: 4,
        title: 'Example Footer',
        templateSlug: 'example',
    },
];

export const DEFAULT_STORE_COLORS: StoreColors = {
    primary: '#1a1a1a',
    secondary: '#3b82f6',
    background: '#f9fafb',
    surface: '#ffffff',
    text: '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#f59e0b',
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
    key: 'main',
    templateSlug: 'default',
    templateSectionsSnapshot: [
        'hero',
        'features',
        'categories',
        'promotional-banners',
        'products',
        'promo-banner',
        'brands',
        'testimonials',
        'instagram-feed',
        'shopping-guides',
        'faq',
        'newsletter',
        'footer'
    ],
    storeName: 'STORE',
    logoUrl: null,
    fontStyle: 'default',
    colors: DEFAULT_STORE_COLORS,
    sections: DEFAULT_STORE_SECTIONS,
};

export const getTemplateSectionsBySlug = (templateSlug?: string): StoreSection[] => {
    const normalizedSlug = templateSlug || DEFAULT_STORE_SETTINGS.templateSlug || 'default';

    if (normalizedSlug === 'example') {
        return EXAMPLE_STORE_SECTIONS;
    }

    return DEFAULT_STORE_SECTIONS;
};

export const FONT_OPTIONS = [
    { key: 'default', label: 'Default' },
    { key: 'cairo', label: 'Cairo' },
    { key: 'inter', label: 'Inter' },
    { key: 'poppins', label: 'Poppins' },
    { key: 'roboto', label: 'Roboto' },
    { key: 'tajawal', label: 'Tajawal' },
    { key: 'outfit', label: 'Outfit' },
    { key: 'alexandria', label: 'Alexandria' },
    { key: 'plus-jakarta-sans', label: 'Plus Jakarta Sans' },
    { key: 'amiri', label: 'Amiri' },
] as const;

export const normalizeFontStyle = (value?: string): string => {
    if (!value) return 'default';

    const normalized = value.trim().toLowerCase().replace(/\s+/g, '-');

    const directMap: Record<string, string> = {
        default: 'default',
        cairo: 'cairo',
        inter: 'inter',
        poppins: 'poppins',
        roboto: 'roboto',
        tajawal: 'tajawal',
        outfit: 'outfit',
        alexandria: 'alexandria',
        'plus-jakarta-sans': 'plus-jakarta-sans',
        'plus-jakarta': 'plus-jakarta-sans',
        amiri: 'amiri',
        amr: 'amiri',
    };

    return directMap[normalized] || 'default';
};

export const FONT_FAMILY_MAP: Record<string, { fontName: string; fontUrl?: string; className?: string }> = {
    default: {
        fontName: 'Inter, system-ui, -apple-system, sans-serif',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
    },
    cairo: {
        fontName: 'Cairo, sans-serif',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap',
    },
    tajawal: {
        fontName: 'Tajawal, sans-serif',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap',
    },
    alexandria: {
        fontName: 'Alexandria, sans-serif',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&display=swap',
    },
    inter: {
        fontName: 'Inter, sans-serif',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
    },
    poppins: {
        fontName: 'Poppins, sans-serif',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
    },
    roboto: {
        fontName: 'Roboto, sans-serif',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',
    },
    outfit: {
        fontName: 'Outfit, sans-serif',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap',
    },
    'plus-jakarta-sans': {
        fontName: '"Plus Jakarta Sans", sans-serif',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
    },
    amiri: {
        fontName: 'Amiri, serif',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
    },
};
