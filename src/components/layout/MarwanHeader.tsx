'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
    MessageCircle, Moon, Search, ShoppingCart, Sun, UserRound,
} from 'lucide-react';
import { useGet } from '@/hooks/useGet';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';
import { CART_COUNT_BADGE_CLASS, HEADER_ACTION_BASE_CLASS } from '@/components/layout/headerStyles';
import { useTranslation } from '@/hooks/useTranslation';
import { ApiResponse, Brand } from '@/types/api';
import { RootState } from '@/store/store';

interface HeaderNavItem {
    key: string;
    label: string;
    href: string;
}

interface MarwanHeaderProps {
    activeSection?: string;
    homeNavItems?: HeaderNavItem[];
    searchText?: string;
    onSearchTextChange?: (value: string) => void;
    matchingBrand?: Brand;
}

type HeaderThemeStyle = React.CSSProperties & {
    '--store-header-bg': string;
    '--store-header-surface': string;
    '--store-header-text': string;
    '--store-header-muted': string;
    '--store-header-border': string;
    '--store-header-primary': string;
    '--store-header-primary-on': string;
};

const HEADER_LINKS: Record<string, { label: string; href: string }> = {
    home: { label: 'home', href: '/' },
    about: { label: 'about', href: '/about' },
    products: { label: 'products', href: '/products' },
    product: { label: 'products', href: '/products' },
    categories: { label: 'categories', href: '/categories' },
    category: { label: 'categories', href: '/categories' },
    brands: { label: 'brands', href: '/brands' },
    brand: { label: 'brands', href: '/brands' },
    'track-order': { label: 'trackOrder', href: '/order-tracking' },
    'order-tracking': { label: 'trackOrder', href: '/order-tracking' },
    'why-us': { label: 'whyUs', href: '/about#why-us' },
    contact: { label: 'contact', href: '/about#store-connect' },
};

export default function MarwanHeader({
    activeSection,
    homeNavItems,
    searchText: controlledSearchText,
    onSearchTextChange,
    matchingBrand: suppliedMatchingBrand,
}: MarwanHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { colors, storeName, logoUrl, settings, themeMode, toggleTheme, language, toggleLanguage } = useStoreSettings();
    const { t, getLocalized } = useTranslation();
    const token = useSelector((state: RootState) => state.auth.token);
    const cartCount = useSelector((state: RootState) => state.cart.items.length);
    const [menuOpen, setMenuOpen] = useState(false);
    const [internalSearchText, setInternalSearchText] = useState('');
    const isHome = pathname === '/';
    const isDarkMode = themeMode === 'dark';
    const activePrimary = isDarkMode ? colors.primaryDark || colors.primary : colors.primary;
    const activeSecondary = isDarkMode ? colors.secondaryDark || colors.secondary : colors.secondary;
    const activeBackground = isDarkMode ? colors.backgroundDark || colors.background : colors.background;
    const activeTextPrimary = isDarkMode ? colors.textPrimaryDark || colors.textPrimary : colors.textPrimary;
    const activeTextSecondary = isDarkMode ? colors.textSecondaryDark || colors.textSecondary : colors.textSecondary;
    const headerThemeStyle: HeaderThemeStyle = {
        '--store-header-bg': isDarkMode
            ? `color-mix(in srgb, ${activeBackground || '#111827'} 86%, white 14%)`
            : activeSecondary || activeBackground || '#ffffff',
        '--store-header-surface': isDarkMode
            ? activeBackground || '#111827'
            : `color-mix(in srgb, ${activeBackground || '#ffffff'} 92%, ${activeTextPrimary || '#111827'} 8%)`,
        '--store-header-text': activeTextPrimary || '#111827',
        '--store-header-muted': activeTextSecondary || '#6b7280',
        '--store-header-border': isDarkMode
            ? 'color-mix(in srgb, white 18%, transparent)'
            : `color-mix(in srgb, ${activeTextPrimary || '#111827'} 14%, transparent)`,
        '--store-header-primary': activePrimary || '#1a1a1a',
        '--store-header-primary-on': activeSecondary || '#ffffff',
    };

    const searchValue = controlledSearchText ?? internalSearchText;
    const normalizedSearch = searchValue.trim().toLowerCase();
    const { data: brandsResponse } = useGet<ApiResponse<Brand>>(['brands'], '/brand');
    const brands = brandsResponse?.data?.data || [];
    const matchingBrand = suppliedMatchingBrand || (normalizedSearch.length >= 2
        ? brands.find((brand) =>
            [brand.name, brand.ar_name].some((name) => name?.toLowerCase() === normalizedSearch)
        ) || brands.find((brand) =>
            [brand.name, brand.ar_name].some((name) => name?.toLowerCase().includes(normalizedSearch))
        )
        : undefined);

    const headerData = settings.ecommerceData?.[0]?.header || {};
    const footerData = settings.ecommerceData?.[0]?.footer || {};
    const contactLinks = settings.ecommerceData?.[0]?.social_links || {};
    const displayStoreName = storeName || headerData.title || 'STORE';
    const displayLogo = footerData.logo || logoUrl || headerData.logo || '';
    const announcementText = headerData.announcement || '';

    const navItems = useMemo<HeaderNavItem[]>(() => {
        if (isHome && homeNavItems) return homeNavItems;

        const configuredLinks = headerData.links?.length
            ? headerData.links
            : ['home', 'about', 'products', 'categories', 'brands'];

        return configuredLinks.map((key) => {
            const normalizedKey = key.toLowerCase().trim();
            const configured = HEADER_LINKS[normalizedKey];
            return configured
                ? {
                    key: normalizedKey,
                    label: t.nav[configured.label as keyof typeof t.nav],
                    href: configured.href,
                }
                : {
                    key: normalizedKey,
                    label: normalizedKey.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
                    href: `/${normalizedKey.replace(/\s+/g, '-')}`,
                };
        });
    }, [headerData.links, homeNavItems, isHome, t.nav]);

    const setSearchValue = (value: string) => {
        if (onSearchTextChange) {
            onSearchTextChange(value);
        } else {
            setInternalSearchText(value);
        }
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (matchingBrand) {
            router.push(`/brands#${matchingBrand._id}`);
        } else if (!isHome && normalizedSearch) {
            router.push(`/products?search=${encodeURIComponent(searchValue.trim())}`);
        }
    };

    const navLinkClass = (active: boolean) =>
        `text-[13px] font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors ${
            active
                ? 'border-[var(--store-header-primary)] text-[var(--store-header-text)]'
                : 'border-transparent text-[var(--store-header-muted)] hover:text-[var(--store-header-text)]'
        }`;

    const isNavItemActive = (item: HeaderNavItem) => isHome
        ? activeSection === item.key
        : item.href === '/'
            ? pathname === '/'
            : pathname?.startsWith(item.href.split('#')[0]);

    return (
        <div className="relative z-50">
            {announcementText && (
                <div
                    className="sticky top-0 z-[55] flex items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-bold"
                    style={isDarkMode
                        ? { background: 'var(--store-header-bg)', color: 'var(--store-header-text)', borderBottom: '1px solid var(--store-header-border)' }
                        : { background: 'var(--store-header-primary)', color: 'var(--store-header-primary-on)' }}
                >
                    <span>{announcementText}</span>
                </div>
            )}
            <header
                style={headerThemeStyle}
                className={`store-themed-chrome sticky z-50 border-b transition-shadow duration-300 ${announcementText ? 'top-7' : 'top-0'}`}
            >
                <div className="mx-auto flex h-[72px] max-w-[1460px] items-center justify-between gap-4 px-4">
                    <Link href="/" className="flex h-14 w-[150px] shrink-0 items-center md:w-[220px]" aria-label={displayStoreName}>
                        {displayLogo ? (
                            <img src={displayLogo} alt={displayStoreName} className="max-h-14 max-w-full object-contain object-left" />
                        ) : (
                            <span className="text-[28px] font-black uppercase leading-none tracking-tight md:text-[36px]" style={{ color: 'var(--store-header-text)' }}>
                                {displayStoreName}
                            </span>
                        )}
                    </Link>

                    <div className="hidden flex-1 justify-center px-3 md:flex">
                        <form onSubmit={handleSearchSubmit} className="relative flex w-full max-w-[460px] items-center gap-3 rounded-full border px-4 py-2" style={{ borderColor: 'var(--store-header-border)' }}>
                            <Search size={16} style={{ color: 'var(--store-header-muted)' }} />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder={t.common.searchPlaceholder}
                                className="w-full bg-transparent text-sm outline-none"
                                style={{ color: 'var(--store-header-text)' }}
                            />
                            {matchingBrand && normalizedSearch.length >= 2 && (
                                <Link
                                    href={`/brands#${matchingBrand._id}`}
                                    className="absolute inset-x-0 top-full z-50 mt-2 rounded-xl border px-4 py-3 text-sm font-bold shadow-lg"
                                    style={{ background: 'var(--store-header-bg)', color: 'var(--store-header-text)', borderColor: 'var(--store-header-border)' }}
                                >
                                    {getLocalized(matchingBrand)} <span className="font-normal" style={{ color: 'var(--store-header-muted)' }}>— {t.nav.brands}</span>
                                </Link>
                            )}
                        </form>
                    </div>

                    <nav className="hidden shrink-0 items-center justify-center gap-6 lg:flex">
                        {navItems.map((item) => (
                            <Link key={item.key} href={item.href} className={navLinkClass(isNavItemActive(item))}>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex shrink-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleLanguage}
                            aria-label={language === 'ar' ? t.sections.switchToEnglish : t.sections.switchToArabic}
                            title={language === 'ar' ? t.sections.english : t.sections.arabic}
                            className={`${HEADER_ACTION_BASE_CLASS} text-xs font-black`}
                            style={{ backgroundColor: 'var(--store-header-surface)', borderColor: 'var(--store-header-border)', color: 'var(--store-header-text)' }}
                        >
                            {language.toUpperCase()}
                        </button>
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={themeMode === 'dark' ? t.sections.switchToLightMode : t.sections.switchToDarkMode}
                            aria-pressed={themeMode === 'dark'}
                            title={themeMode === 'dark' ? t.sections.lightMode : t.sections.darkMode}
                            className={HEADER_ACTION_BASE_CLASS}
                            style={{ backgroundColor: 'var(--store-header-surface)', borderColor: 'var(--store-header-border)', color: 'var(--store-header-text)' }}
                        >
                            {themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <Link
                            href="/cart"
                            title={t.nav.cart}
                            aria-label={`${t.nav.cart}${cartCount > 0 ? ` (${cartCount})` : ''}`}
                            className={HEADER_ACTION_BASE_CLASS}
                            style={{ backgroundColor: 'var(--store-header-surface)', borderColor: 'var(--store-header-border)', color: 'var(--store-header-text)' }}
                        >
                            <ShoppingCart size={20} />
                            {cartCount > 0 && <span className={CART_COUNT_BADGE_CLASS}>{cartCount}</span>}
                        </Link>
                        <Link
                            href={token ? '/profile' : '/login'}
                            aria-label={token ? t.nav.profile : t.nav.login}
                            title={token ? t.nav.profile : t.nav.login}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:opacity-80"
                            style={{ borderColor: 'var(--store-header-border)', color: 'var(--store-header-text)' }}
                        >
                            <UserRound size={17} />
                        </Link>
                        {contactLinks.whatsapp && (
                            <a
                                href={contactLinks.whatsapp}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={t.sections.whatsapp}
                                className="hidden h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-700 sm:inline-flex"
                            >
                                <MessageCircle size={16} />
                            </a>
                        )}
                        <Link
                            href="/categories"
                            className="hidden items-center justify-center rounded-full px-5 py-2.5 text-[12px] font-extrabold uppercase tracking-wider transition-transform hover:-translate-y-0.5 md:inline-flex"
                            style={{ background: 'var(--store-header-primary)', color: 'var(--store-header-primary-on)' }}
                        >
                            {t.home.shopNow} →
                        </Link>
                        <button
                            className="text-2xl leading-none lg:hidden"
                            aria-label={menuOpen ? t.common.close : t.nav.menu}
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((current) => !current)}
                            style={{ color: 'var(--store-header-text)' }}
                        >
                            {menuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-5 pb-4 lg:hidden">
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-full border px-3 py-2" style={{ borderColor: 'var(--store-header-border)' }}>
                            <Search size={16} style={{ color: 'var(--store-header-muted)' }} />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder={t.common.searchPlaceholder}
                                className="w-full bg-transparent text-sm outline-none"
                                style={{ color: 'var(--store-header-text)' }}
                            />
                        </form>
                        {navItems.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className="py-1 text-sm font-bold uppercase"
                                style={{ color: isNavItemActive(item) ? 'var(--store-header-text)' : 'var(--store-header-muted)' }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}
            </header>
        </div>
    );
}
