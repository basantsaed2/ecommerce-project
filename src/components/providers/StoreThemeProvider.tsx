'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreSettingsApi, updateStoreSettingsApi } from '@/api/storeSettings';
import {
    StoreSettings,
    StoreColors,
    StoreSection,
    UpdateStoreSettingsPayload,
    StoreLanguage
} from '@/types/storeSettings';
import {
    DEFAULT_STORE_SETTINGS,
    DEFAULT_STORE_COLORS,
    DEFAULT_STORE_SECTIONS,
    getTemplateSectionsBySlug,
    FONT_FAMILY_MAP,
    normalizeFontStyle
} from '@/utils/themeDefaults';
import { getCurrentLanguage, setCurrentLanguage } from '@/utils/language';
import { toast } from 'sonner';

interface StoreThemeContextType {
    settings: StoreSettings;
    storeName: string;
    logoUrl: string | null;
    colors: StoreColors;
    fontStyle: string;
    templateSlug: string;
    sections: StoreSection[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
    updateSettings: (payload: UpdateStoreSettingsPayload) => Promise<void>;
    isUpdating: boolean;
    themeMode: 'light' | 'dark';
    toggleTheme: () => void;
    language: StoreLanguage;
    toggleLanguage: () => void;
}

const StoreThemeContext = createContext<StoreThemeContextType>({
    settings: DEFAULT_STORE_SETTINGS,
    storeName: DEFAULT_STORE_SETTINGS.storeName,
    logoUrl: DEFAULT_STORE_SETTINGS.logoUrl,
    colors: DEFAULT_STORE_COLORS,
    fontStyle: DEFAULT_STORE_SETTINGS.fontStyle,
    templateSlug: DEFAULT_STORE_SETTINGS.templateSlug,
    sections: DEFAULT_STORE_SECTIONS,
    isLoading: false,
    isError: false,
    refetch: () => {},
    updateSettings: async () => {},
    isUpdating: false,
    themeMode: 'light',
    toggleTheme: () => {},
    language: 'en',
    toggleLanguage: () => {},
});

export function StoreThemeProvider({
    children,
    initialSettings,
}: {
    children: React.ReactNode;
    initialSettings?: StoreSettings;
}) {
    const queryClient = useQueryClient();
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
    const [language, setLanguage] = useState<StoreLanguage>('en');

    useEffect(() => {
        const savedTheme = window.localStorage.getItem('store-theme-mode');
        const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setThemeMode(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preferredTheme);
    }, []);

    useEffect(() => {
        setLanguage(getCurrentLanguage());
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', themeMode === 'dark');
        document.documentElement.style.colorScheme = themeMode;
        window.localStorage.setItem('store-theme-mode', themeMode);
    }, [themeMode]);

    const toggleTheme = () => {
        setThemeMode((currentMode) => currentMode === 'dark' ? 'light' : 'dark');
    };

    const toggleLanguage = () => {
        const nextLanguage: StoreLanguage = language === 'ar' ? 'en' : 'ar';
        setLanguage(nextLanguage);
        setCurrentLanguage(nextLanguage);
        document.documentElement.lang = nextLanguage;
        document.documentElement.dir = nextLanguage === 'ar' ? 'rtl' : 'ltr';
        queryClient.invalidateQueries();
    };

    const {
        data: apiResponse,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['store-settings'],
        queryFn: getStoreSettingsApi,
        initialData: initialSettings
            ? {
                success: true,
                data: {
                    message: 'Store settings loaded from SSR',
                    settings: initialSettings,
                },
            }
            : undefined,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    const rawSettings = apiResponse?.data?.settings;

    // Merge backend settings with safe defaults
    const mergedSettings: StoreSettings = useMemo(() => {
        if (!rawSettings) return DEFAULT_STORE_SETTINGS;

        const colors: StoreColors = {
            ...DEFAULT_STORE_COLORS,
            ...(rawSettings.colors || {}),
        };

        const templateSlug = rawSettings.templateSlug || DEFAULT_STORE_SETTINGS.templateSlug;
        const fontStyle = normalizeFontStyle(rawSettings.fontStyle || DEFAULT_STORE_SETTINGS.fontStyle);

        const sections: StoreSection[] =
            Array.isArray(rawSettings.sections) && rawSettings.sections.length > 0
                ? rawSettings.sections.map((section) => ({
                    ...section,
                    templateSlug: section.templateSlug || templateSlug,
                }))
                : getTemplateSectionsBySlug(templateSlug);

        return {
            ...DEFAULT_STORE_SETTINGS,
            ...rawSettings,
            storeName: rawSettings.storeName || DEFAULT_STORE_SETTINGS.storeName,
            templateSlug,
            fontStyle,
            colors,
            sections,
        };
    }, [rawSettings]);

    // Mutation for updating store settings
    const updateMutation = useMutation({
        mutationFn: updateStoreSettingsApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['store-settings'] });
            toast.success('تم تحديث إعدادات وقالب المتجر بنجاح');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'حدث خطأ أثناء حفظ الإعدادات');
        },
    });

    const handleUpdateSettings = async (payload: UpdateStoreSettingsPayload) => {
        await updateMutation.mutateAsync(payload);
    };

    // Apply Dynamic Theme Styles (CSS Variables & Google Fonts)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const { colors, fontStyle } = mergedSettings;
        const fontConfig = FONT_FAMILY_MAP[fontStyle] || FONT_FAMILY_MAP.default;
        const isDarkMode = themeMode === 'dark';

        if (mergedSettings.logoUrl) {
            let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.type = 'image/png';
            favicon.href = mergedSettings.logoUrl;
        }

        // 1. Injected Google Font Link
        if (fontConfig.fontUrl) {
            let fontLink = document.getElementById('dynamic-google-font') as HTMLLinkElement | null;
            if (!fontLink) {
                fontLink = document.createElement('link');
                fontLink.id = 'dynamic-google-font';
                fontLink.rel = 'stylesheet';
                document.head.appendChild(fontLink);
            }
            if (fontLink.href !== fontConfig.fontUrl) {
                fontLink.href = fontConfig.fontUrl;
            }
        }

        // 2. Inject Dynamic CSS Variables
        let styleTag = document.getElementById('dynamic-store-theme') as HTMLStyleElement | null;
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamic-store-theme';
            document.head.appendChild(styleTag);
        }

        const primaryColor = isDarkMode
            ? colors.primaryDark || colors.primary || '#1a1a1a'
            : colors.primary || '#1a1a1a';
        const secondaryColor = isDarkMode
            ? colors.secondaryDark || colors.secondary || '#3b82f6'
            : colors.secondary || '#3b82f6';
        const backgroundColor = isDarkMode
            ? colors.backgroundDark || colors.background || '#111827'
            : colors.background || '#f9fafb';
        const surfaceColor = isDarkMode
            ? colors.backgroundDark || colors.surface || backgroundColor
            : colors.surface || '#ffffff';
        const textColor = isDarkMode
            ? colors.textPrimaryDark || colors.textPrimary || colors.text || '#f8fafc'
            : colors.textPrimary || colors.text || '#111827';
        const textMutedColor = isDarkMode
            ? colors.textSecondaryDark || colors.textSecondary || colors.textMuted || '#94a3b8'
            : colors.textSecondary || colors.textMuted || '#6b7280';
        const borderColor = colors.border || '#e5e7eb';
        const accentColor = colors.accent || '#f59e0b';

        styleTag.innerHTML = `
            :root {
                --color-primary: ${primaryColor};
                --color-secondary: ${secondaryColor};
                --color-background: ${backgroundColor};
                --color-surface: ${surfaceColor};
                --color-text: ${textColor};
                --color-text-muted: ${textMutedColor};
                --color-border: ${borderColor};
                --color-accent: ${accentColor};
                --font-store: ${fontConfig.fontName};
            }
            body {
                font-family: var(--font-store), sans-serif;
                background-color: var(--color-background);
                color: var(--color-text);
            }
        `;
    }, [mergedSettings, themeMode]);

    const contextValue: StoreThemeContextType = useMemo(
        () => ({
            settings: mergedSettings,
            storeName: mergedSettings.storeName,
            logoUrl: mergedSettings.logoUrl,
            colors: mergedSettings.colors,
            fontStyle: mergedSettings.fontStyle,
            templateSlug: mergedSettings.templateSlug,
            sections: mergedSettings.sections,
            isLoading,
            isError,
            refetch,
            updateSettings: handleUpdateSettings,
            isUpdating: updateMutation.isPending,
            themeMode,
            toggleTheme,
            language,
            toggleLanguage,
        }),
        [mergedSettings, isLoading, isError, refetch, updateMutation.isPending, themeMode, language]
    );

    return (
        <StoreThemeContext.Provider value={contextValue}>
            {children}
        </StoreThemeContext.Provider>
    );
}

export function useStoreSettings() {
    const context = useContext(StoreThemeContext);
    if (!context) {
        throw new Error('useStoreSettings must be used within a StoreThemeProvider');
    }
    return context;
}
