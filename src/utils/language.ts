import { getCookie, setCookie } from 'cookies-next';
import type { StoreLanguage } from '@/types/storeSettings';

export const DEFAULT_LANGUAGE: StoreLanguage = 'ar';
export const LANGUAGE_COOKIE = 'store-language';

export const getCurrentLanguage = (): StoreLanguage => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

    const language = getCookie(LANGUAGE_COOKIE);
    if (language === 'en' || language === 'ar') {
        return language;
    }

    try {
        const localLang = window.localStorage?.getItem(LANGUAGE_COOKIE);
        if (localLang === 'en' || localLang === 'ar') {
            return localLang;
        }
    } catch {
        // Ignore localStorage errors
    }

    return DEFAULT_LANGUAGE;
};

export const setCurrentLanguage = (language: StoreLanguage) => {
    setCookie(LANGUAGE_COOKIE, language, { maxAge: 60 * 60 * 24 * 365, path: '/' });
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(LANGUAGE_COOKIE, language);
    }
};