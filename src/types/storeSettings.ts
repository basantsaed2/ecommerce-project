export interface StoreColors {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
    text?: string;
    textMuted?: string;
    border?: string;
    accent?: string;
}

export type SectionKey = 
    | 'announcement-bar'
    | 'hero' 
    | 'banners'
    | 'features'
    | 'trust-badges'
    | 'categories' 
    | 'products' 
    | 'featured-products'
    | 'best-sellers'
    | 'new-arrivals'
    | 'promo-banner' 
    | 'flash-sale'
    | 'deals-of-the-day'
    | 'promotional-banners'
    | 'sub-banners'
    | 'promo-grid'
    | 'brands' 
    | 'brand-logos'
    | 'testimonials' 
    | 'customer-reviews'
    | 'instagram-feed'
    | 'social-proof'
    | 'blog-guides'
    | 'shopping-guides'
    | 'faq'
    | 'newsletter' 
    | 'footer'
    | string;

export interface StoreSection {
    key: SectionKey;
    enabled: boolean;
    templateSlug?: string;
    order?: number;
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export type FontStyleOption = 
    | 'default' 
    | 'cairo' 
    | 'inter' 
    | 'poppins' 
    | 'roboto' 
    | 'tajawal' 
    | 'outfit' 
    | 'alexandria' 
    | 'plus-jakarta-sans'
    | string;

export type TemplateSlugOption = 
    | 'default' 
    | 'example'
    | 'marwan'
    | 'modern-shop' 
    | 'minimal' 
    | 'elegance' 
    | 'bold'
    | string;

export interface StoreSettings {
    _id?: string;
    key: string;
    templateSlug: TemplateSlugOption;
    templateSectionsSnapshot: string[];
    storeName: string;
    logoUrl: string | null;
    fontStyle: FontStyleOption;
    colors: StoreColors;
    sections: StoreSection[];
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export interface StoreSettingsResponse {
    success: boolean;
    data: {
        message: string;
        settings: StoreSettings;
    };
}

export interface ThemeCategory {
    _id: string;
    name: string;
    description: string;
    ar_name?: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export interface ThemeCategoriesResponse {
    success: boolean;
    data: {
        message: string;
        categories: {
            message?: string;
            categories: ThemeCategory[];
        };
    };
}

export interface ThemeItem {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    category?: string | ThemeCategory;
    previewImage?: string;
    defaultColors?: StoreColors;
    defaultFontStyle?: FontStyleOption;
    supportedSections?: string[];
    defaultSections?: StoreSection[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ThemesResponse {
    success: boolean;
    data: {
        message: string;
        themes: ThemeItem[];
    };
}

export interface SingleThemeResponse {
    success: boolean;
    data: {
        message: string;
        theme: ThemeItem;
    };
}

export interface UpdateStoreSettingsPayload {
    key: string;
    templateSlug: string;
    templateSectionsSnapshot: string[];
    storeName: string;
    logoUrl?: string | null;
    fontStyle: string;
    colors: StoreColors;
    sections: StoreSection[];
}
