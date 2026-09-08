'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreSettingsApi, updateStoreSettingsApi } from '@/api/storeSettings';
import {
    StoreSettings,
    StoreColors,
    StoreSection,
    UpdateStoreSettingsPayload
} from '@/types/storeSettings';
import {
    DEFAULT_STORE_SETTINGS,
    DEFAULT_STORE_COLORS,
    DEFAULT_STORE_SECTIONS,
    FONT_FAMILY_MAP
} from '@/utils/themeDefaults';
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
});

export function StoreThemeProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();

    const {
        data: apiResponse,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['store-settings'],
        queryFn: getStoreSettingsApi,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
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

        const sections: StoreSection[] =
            Array.isArray(rawSettings.sections) && rawSettings.sections.length > 0
                ? rawSettings.sections
                : DEFAULT_STORE_SECTIONS;

        return {
            ...DEFAULT_STORE_SETTINGS,
            ...rawSettings,
            storeName: rawSettings.storeName || DEFAULT_STORE_SETTINGS.storeName,
            templateSlug: rawSettings.templateSlug || DEFAULT_STORE_SETTINGS.templateSlug,
            fontStyle: rawSettings.fontStyle || DEFAULT_STORE_SETTINGS.fontStyle,
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

        const primaryColor = colors.primary || '#1a1a1a';
        const secondaryColor = colors.secondary || '#3b82f6';
        const backgroundColor = colors.background || '#f9fafb';
        const surfaceColor = colors.surface || '#ffffff';
        const textColor = colors.text || '#111827';
        const textMutedColor = colors.textMuted || '#6b7280';
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
    }, [mergedSettings]);

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
        }),
        [mergedSettings, isLoading, isError, refetch, updateMutation.isPending]
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
