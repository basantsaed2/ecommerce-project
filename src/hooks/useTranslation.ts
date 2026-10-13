'use client';

import { useStoreSettings } from '@/components/providers/StoreThemeProvider';
import { dictionary, Dictionary, Language } from '@/locales/dictionary';

export function useTranslation() {
  const { language, toggleLanguage } = useStoreSettings();
  const currentLang: Language = (language === 'ar' ? 'ar' : 'en') as Language;
  const isRtl = currentLang === 'ar';
  const t: Dictionary = dictionary[currentLang] || dictionary.en;

  /**
   * Helper to pick Arabic/English text from an API record
   * e.g. getLocalized(product, 'name') -> returns product.ar_name if arabic, else product.name
   */
  const getLocalized = (
    item: any,
    field: string = 'name',
    fallbackField?: string
  ): string => {
    if (!item) return '';

    if (currentLang === 'ar') {
      const arVal = item[`ar_${field}`] || item[`${field}_ar`] || item[field];
      if (arVal) return String(arVal);
    } else {
      const enVal = item[field] || item[`${field}_en`] || item[`en_${field}`];
      if (enVal) return String(enVal);
    }

    if (fallbackField && item[fallbackField]) {
      return String(item[fallbackField]);
    }

    return String(item[field] || item.name || item.title || '');
  };

  /**
   * Format price with currency based on current language
   */
  const formatPrice = (amount: number | string | undefined | null): string => {
    const num = Number(amount ?? 0);
    const formatted = num.toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US');
    return isRtl ? `${formatted} ${t.common.currency}` : `${t.common.currency} ${formatted}`;
  };

  return {
    t,
    language: currentLang,
    isRtl,
    toggleLanguage,
    getLocalized,
    formatPrice,
  };
}

export default useTranslation;
