import { getCookie, setCookie } from 'cookies-next';
import type { StoreLanguage } from '@/types/storeSettings';

export const DEFAULT_LANGUAGE: StoreLanguage = 'en';
export const LANGUAGE_COOKIE = 'store-language';

export const getCurrentLanguage = (): StoreLanguage => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

    const language = getCookie(LANGUAGE_COOKIE);
    return language === 'ar' ? 'ar' : DEFAULT_LANGUAGE;
};

export const setCurrentLanguage = (language: StoreLanguage) => {
    setCookie(LANGUAGE_COOKIE, language, { maxAge: 60 * 60 * 24 * 365, path: '/' });
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(LANGUAGE_COOKIE, language);
    }
};