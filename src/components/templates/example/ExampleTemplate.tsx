'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  Search, Heart, ShoppingBag, UserRound, Phone, MapPin,
  ChevronDown, Menu,
  Facebook, Twitter, Instagram, Youtube, Sun, Moon
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGet } from '@/hooks/useGet';
import { useTranslation } from '@/hooks/useTranslation';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';
import { ApiResponse, Banner, Brand, Category, Product } from '@/types/api';
import { CART_COUNT_BADGE_CLASS, HEADER_ACTION_BASE_CLASS } from '@/components/layout/headerStyles';
import StoreLoader from '@/components/common/StoreLoader';
import BestSellersSection from '@/components/sections/products/BestSellersSection';
import OffersSection from '@/components/sections/promo/OffersSection';
import SharedProductCard from '@/components/modules/products/ProductCard';

interface ExampleTemplateProps {
  searchQuery?: string;
  excludeKeys?: string[];
  className?: string;
}

function sectionEnabled(sections: any[] | undefined, key: string, fallback = true) {
  if (!Array.isArray(sections) || sections.length === 0) return fallback;
  const found = sections.find((s) => s?.key === key);
  return found ? found.enabled !== false : fallback;
}

function sectionEnabledAny(sections: any[] | undefined, keys: string[], fallback = true) {
  if (!Array.isArray(sections) || sections.length === 0) return fallback;
  const matchingSections = sections.filter((section) => keys.includes(section?.key?.toLowerCase()));
  return matchingSections.length === 0
    ? fallback
    : matchingSections.some((section) => section.enabled !== false);
}

function readableForeground(color?: string): string {
  const hex = (color || '').trim().replace(/^#/, '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  if (!/^[\da-f]{6}$/i.test(full)) return '#ffffff';
  const [r, g, b] = full.match(/.{2}/g)!.map((ch) => {
    const v = parseInt(ch, 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? '#111827' : '#ffffff';
}

export default function ExampleTemplate({
  searchQuery = '',
  excludeKeys = [],
  className = '',
}: ExampleTemplateProps) {
  const { colors, sections, storeName, logoUrl, fontStyle, settings, themeMode, toggleTheme, language, toggleLanguage } = useStoreSettings();
  const { t, isRtl, getLocalized } = useTranslation();
  const token = useSelector((state: RootState) => state.auth.token);
  const cartCount = useSelector((state: RootState) => state.cart.items.length);
  const isDarkMode = themeMode === 'dark';
  const activePrimary = isDarkMode ? colors?.primaryDark || colors?.primary : colors?.primary;
  const activeSecondary = isDarkMode ? colors?.secondaryDark || colors?.secondary : colors?.secondary;
  const activeBackground = isDarkMode ? colors?.backgroundDark || colors?.background : colors?.background;
  const activeTextPrimary = isDarkMode ? colors?.textPrimaryDark || colors?.textPrimary : colors?.textPrimary;
  const activeTextSecondary = isDarkMode ? colors?.textSecondaryDark || colors?.textSecondary : colors?.textSecondary;
  const headerActionClassName = `${HEADER_ACTION_BASE_CLASS} hover:opacity-80`;
  const headerActionStyle = {
    backgroundColor: activeBackground || '#ffffff',
    borderColor: 'var(--bs-border)',
    color: activeTextPrimary || '#111827',
  };
  const ecommerceData = settings.ecommerceData?.[0];
  const header = ecommerceData?.header || {};
  const footer = ecommerceData?.footer || {};
  const socialLinks = ecommerceData?.social_links || {};
  const contactInfo = ecommerceData || {};
  const headerLinks = header.links || [];
  const headerLinkConfig: Record<string, { label: string; href: string }> = {
    home: { label: t.nav.home, href: '/' },
    category: { label: t.nav.categories, href: '/categories' },
    categories: { label: t.nav.categories, href: '/categories' },
    products: { label: t.nav.products, href: '/products' },
    brands: { label: t.nav.brands, href: '/brands' },
    about: { label: t.nav.about, href: '/about' },
    'track-order': { label: t.nav.trackOrder, href: '/order-tracking' },
    'order-tracking': { label: t.nav.trackOrder, href: '/order-tracking' },
  };
  const dynamicHeaderLinks = headerLinks
    .map((link) => {
      const normalizedLink = link.toLowerCase().trim();
      return headerLinkConfig[normalizedLink] || {
        label: normalizedLink.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
        href: `/${normalizedLink.replace(/\s+/g, '-')}`,
      };
    });

  // ── 1. Dynamic Backend API Hooks ───────────────────────────────────────
  const { data: bannersData, isLoading: bannersLoading } = useGet<ApiResponse<Banner>>(['banners'], '/banner');
  const { data: categoriesData, isLoading: categoriesLoading } = useGet<ApiResponse<Category>>(['categories'], '/category');
  const { data: productsData, isLoading: productsLoading } = useGet<ApiResponse<Product>>(['products'], '/product');
  const { data: brandsData } = useGet<ApiResponse<Brand>>(['brands'], '/brand');

  const [currentSearch, setCurrentSearch] = useState(searchQuery);
  const [catMenuOpen, setCatMenuOpen] = useState(true);

  const showHero = sectionEnabled(sections, 'hero');
  const showFeaturedProducts = sectionEnabled(sections, 'features');
  const showProducts = sectionEnabled(sections, 'products');
  const showNewArrivals = sectionEnabled(sections, 'new-arrivals');
  const showBrands = sectionEnabled(sections, 'brands');
  const showBestSellers = sectionEnabledAny(sections, ['best-sellers', 'best-seller', 'bestsellers']);
  const showOffers = sectionEnabledAny(sections, ['offers', 'offer', 'offer-products', 'special-offers']);
  const showFooter = sectionEnabled(sections, 'footer') && !excludeKeys.includes('footer');

  // Dynamic Theme Styling Variable Map
  const themeVars = {
    ['--bs-primary' as any]: activePrimary || '#d9232d',
    ['--bs-secondary' as any]: activeSecondary || '#1e293b',
    ['--bs-bg' as any]: activeBackground || '#f8fafc',
    ['--bs-text' as any]: activeTextPrimary || '#0f172a',
    ['--bs-text-muted' as any]: activeTextSecondary || '#64748b',
    ['--bs-on-primary' as any]: readableForeground(activePrimary || '#d9232d'),
    ['--bs-surface' as any]: 'color-mix(in srgb, var(--bs-bg) 96%, var(--bs-text) 4%)',
    ['--bs-border' as any]: 'color-mix(in srgb, var(--bs-text) 14%, transparent)',
    ['--bs-font' as any]: fontStyle ? `'${fontStyle}', sans-serif` : 'sans-serif',
  } as React.CSSProperties;

  // Extract Dynamic Lists
  const categories = useMemo(() => (categoriesData?.data?.data || []).filter((category) => category.is_featured === true), [categoriesData]);
  const banners = useMemo(() => bannersData?.data?.data || [], [bannersData]);
  const allProducts = useMemo(() => productsData?.data?.data || [], [productsData]);
  const products = useMemo(() => allProducts.filter((product) => product.is_featured === true), [allProducts]);
  const brands = useMemo(() => (brandsData?.data?.data || []).filter((brand) => brand.is_featured === true), [brandsData]);

  // Filtered Lists
  const filteredProducts = useMemo(() => {
    const q = currentSearch.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) => 
      p.name?.toLowerCase().includes(q) || 
      p.ar_name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }, [products, currentSearch]);

  const filteredAllProducts = useMemo(() => {
    const q = currentSearch.toLowerCase().trim();
    if (!q) return allProducts;
    return allProducts.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.ar_name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }, [allProducts, currentSearch]);

  const newArrivals = useMemo(
    () => [...filteredAllProducts].sort((a, b) =>
      new Date(b.createdAt || b.created_at || 0).getTime() -
      new Date(a.createdAt || a.created_at || 0).getTime()
    ).slice(0, 4),
    [filteredAllProducts]
  );
  const trendingProducts = useMemo(() => filteredProducts.slice(4, 8), [filteredProducts]);

  const heroMainBanner = banners[0];
  const heroTitle = heroMainBanner?.title || heroMainBanner?.name?.[0] || storeName;
  const heroDescription = heroMainBanner?.description || '';

  const isLoading = bannersLoading || categoriesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[var(--color-background)]">
        <StoreLoader logoUrl={logoUrl} label="Loading your store..." size="lg" />
      </div>
    );
  }

  return (
    <div className={`bs-tpl w-full min-h-screen text-[var(--bs-text)] ${className}`} style={{ ...themeVars, backgroundColor: 'var(--bs-bg)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        .bs-tpl { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* ── Top Utility Bar ────────────────────────────────────────────── */}
      <div className="border-b text-xs py-2 hidden lg:block" style={{ backgroundColor: activeBackground || '#ffffff', borderColor: 'var(--bs-border)', color: activeTextSecondary || '#4b5563' }}>
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} style={{ color: activeTextSecondary || '#9ca3af' }} />
              {contactInfo?.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={14} style={{ color: activeTextSecondary || '#9ca3af' }} />
              {contactInfo?.phone}
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/order-tracking" className="hover:opacity-70 transition-colors flex items-center gap-1 font-bold text-[var(--bs-text)]">📦 {t.nav.trackOrder}</Link>
            <Link href="/signup" className="hover:opacity-70 transition-colors">+ {t.nav.register}</Link>
          </div>
        </div>
      </div>

      {/* ── Main Header (Logo, Search, Icons) ─────────────────────────── */}
      <header className="py-4 border-b" style={{ backgroundColor: activeBackground || '#ffffff', borderColor: 'var(--bs-border)', color: activeTextPrimary || '#111827' }}>
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 text-3xl font-extrabold tracking-tight shrink-0">
              {header.logo || logoUrl ? (
              <img src={header.logo || logoUrl || undefined} alt={header.title || storeName || 'Logo'} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-[var(--bs-text)]">{storeName}</span>
            )}
          </Link>

          <div className="flex-1 max-w-[650px] mx-4">
            <div className="flex items-center border-2 border-[var(--bs-primary)] rounded-md overflow-hidden">
              <input
                type="text"
                placeholder={t.common.searchPlaceholder}
                value={currentSearch}
                onChange={(e) => setCurrentSearch(e.target.value)}
                className="w-full px-4 py-2.5 text-sm outline-none text-[var(--bs-text)] placeholder:text-[var(--bs-text-muted)]"
                style={{ backgroundColor: 'transparent' }}

              />
              <button 
                type="button"
                className="bg-[var(--bs-primary)] text-[var(--bs-on-primary)] px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:brightness-110 transition-all shrink-0"
              >
                <Search size={15} /> {t.common.search.replace('...', '')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
              title={language === 'ar' ? 'English' : 'العربية'}
              className={`${headerActionClassName} text-xs font-black`}
              style={headerActionStyle}
            >
              {language.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={themeMode === 'dark'}
              title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}
              className={headerActionClassName}
              style={headerActionStyle}
            >
              {themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/favourite" aria-label={t.nav.wishlist} className={`relative p-2 transition-colors hover:opacity-70 text-[var(--bs-text)]`}>
              <Heart size={24} />
            </Link>
            <Link
              href="/cart"
              aria-label={`${t.nav.cart}${cartCount > 0 ? ` (${cartCount})` : ''}`}
              className={headerActionClassName}
              style={headerActionStyle}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className={CART_COUNT_BADGE_CLASS}>
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href={token ? '/profile' : '/login'}
              aria-label={token ? t.nav.profile : t.nav.login}
              title={token ? t.nav.profile : t.nav.login}
              className={`relative p-2 transition-colors hover:opacity-70 text-[var(--bs-text)]`}
            >
              <UserRound size={24} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Navigation Bar ────────────────────────────────────────────── */}
      <nav className="border-y" style={{ background: 'var(--bs-surface)', borderColor: 'var(--bs-border)', color: 'var(--bs-text)' }}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-8">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8 w-full">
            <button
              onClick={() => setCatMenuOpen(!catMenuOpen)}
              className="bg-[var(--bs-primary)] text-[var(--bs-on-primary)] font-bold text-xs tracking-wider uppercase px-6 py-3.5 flex items-center gap-3 hover:brightness-110 transition-all w-full md:w-[240px] justify-between"
            >
              <span className="flex items-center gap-2">
                <Menu size={16} /> {t.nav.topCategories}
              </span>
              <ChevronDown size={14} className={`transition-transform ${catMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center gap-5 md:gap-8 text-xs font-bold uppercase tracking-wider overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {dynamicHeaderLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:opacity-70 transition-colors whitespace-nowrap shrink-0">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section (Top Categories + Main Hero) ──────────────────── */}
      {showHero && (
        <section className="max-w-[1400px] mx-auto px-6 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            
            {/* Dynamic Left Categories */}
            <div className={`bg-[var(--bs-surface)] border border-[var(--bs-border)] divide-y divide-[var(--bs-border)] ${catMenuOpen ? 'block' : 'hidden lg:block'}`}>
              {categories.slice(0, 10).map((cat) => (
                <Link
                  key={cat._id}
                  href={`/categories?id=${cat._id}`}
                  className="block px-5 py-3 text-xs font-medium text-[var(--bs-text)] hover:opacity-70 transition-opacity"
                >
                  {getLocalized(cat, 'name')}
                </Link>
              ))}
            </div>

            {/* Dynamic Main Hero Banner */}
            <div className="relative rounded-lg overflow-hidden bg-[var(--bs-surface)] min-h-[380px] flex items-center border border-[var(--bs-border)]">
              {heroMainBanner ? (
                <div className="w-full h-full relative grid grid-cols-1 md:grid-cols-2 items-center p-8" style={{ background: 'linear-gradient(90deg, var(--bs-primary), color-mix(in srgb, var(--bs-primary) 75%, var(--bs-bg)))', color: 'var(--bs-on-primary)' }}>
                  <div className="space-y-4 z-10">
                    <span className="text-xs font-bold tracking-widest uppercase border border-current px-3 py-1 rounded-full">
                      Online Shop
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                      {heroTitle}
                    </h1>
                    <p className="text-xs opacity-90 max-w-md leading-relaxed">
                      {heroDescription}
                    </p>
                    <Link
                      href="/products"
                      className="inline-block bg-[var(--bs-on-primary)] text-[var(--bs-primary)] font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-md shadow-md hover:opacity-90 transition-opacity"
                    >
                      SHOP NOW
                    </Link>
                  </div>
                  <div className="relative flex justify-center items-center mt-6 md:mt-0">
                    <img
                      src={heroMainBanner.images?.[0] || undefined}
                      alt="Hero Product"
                      className="max-h-[300px] object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center w-full">
                  <h2 className="text-2xl font-bold">{storeName}</h2>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Shop by Category Section ────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 py-12 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--bs-text-muted)] mb-1">{t.sections.exploreCatalogLabel}</p>
              <h2 className="text-2xl font-black text-[var(--bs-text)]">{t.sections.shopBy} <span className="text-[var(--bs-text-muted)] italic">{t.sections.collection}.</span></h2>
              <p className="text-xs text-[var(--bs-text-muted)] mt-1">{t.sections.catalogDescription}</p>
            </div>
            <Link href="/categories" className="bg-[var(--bs-primary)] text-[var(--bs-on-primary)] text-xs font-bold uppercase px-4 py-2 rounded hover:brightness-110 flex items-center gap-1.5">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/categories?id=${cat._id}`}
                className="group relative h-44 overflow-hidden rounded-xl border border-[var(--bs-border)] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <img
                  src={cat.image || logoUrl || undefined}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-black text-sm uppercase tracking-tight">{cat.name || cat.ar_name}</h3>
                  {cat.product_quantity !== undefined && (
                    <span className="text-white/70 text-[10px] font-medium">                    {cat.product_quantity} {t.sections.itemsLabel}</span>
                  )}
                </div>
                <div
                  className="absolute inset-x-0 bottom-0 h-[3px] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300"
                  style={{ background: 'var(--bs-primary)' }}
                />
              </Link>
            ))}
          </div>
        </section>
      )}


      {/* ── Dynamic 5-Grid Feature Banners Section ─────────────────── */}
      <FeatureBannersGrid banners={banners.slice(1)} primaryColor="var(--bs-primary)" />

      {/* ── Shop by Brands ────────────────────────────────────────────── */}
      {showBrands && brands.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 py-12 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--bs-text)] mb-6">{t.sections.shopByBrands}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <div key={brand._id} className="bg-[var(--bs-surface)] border border-[var(--bs-border)] rounded-md p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow h-32">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="max-h-14 max-w-full object-contain" />
                ) : (
                  <span className="font-extrabold text-sm text-[var(--bs-text)] uppercase tracking-wider">{brand.name}</span>
                )}
                {brand.logo && <span className="text-sm font-bold text-[var(--bs-text)] text-center line-clamp-1">{getLocalized(brand)}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ──────────────────────────────────────────── */}
      {showFeaturedProducts && filteredProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 py-12 sm:px-6">
          <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--bs-text)]">{t.sections.featuredProductsHeading}</h2>
            <Link href="/products" className="bg-[var(--bs-primary)] text-[var(--bs-on-primary)] text-xs font-bold uppercase px-4 py-2 rounded hover:brightness-110">
              {t.sections.seeAll}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.slice(0, 4).map((prod) => (
              <SharedProductCard key={prod._id} product={prod} badge={t.sections.newLabel} />
            ))}
          </div>
        </section>
      )}

      {/* ── New Arrivals ──────────────────────────────────────────────── */}
      {showNewArrivals && newArrivals.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 py-12 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--bs-text)]">{t.sections.newArrivalsHeading}</h2>
            <Link href="/products" className="bg-[var(--bs-primary)] text-[var(--bs-on-primary)] text-xs font-bold uppercase px-4 py-2 rounded hover:brightness-110">
              {t.sections.seeAll}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <SharedProductCard key={prod._id} product={prod} badge={t.sections.newLabel} />
            ))}
          </div>
        </section>
      )}

      {/* ── Trending Products ─────────────────────────────────────────── */}
      {showProducts && trendingProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 py-12 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--bs-text)]">{t.sections.trendingProductsHeading}</h2>
            <Link href="/products" className="bg-[var(--bs-primary)] text-[var(--bs-on-primary)] text-xs font-bold uppercase px-4 py-2 rounded hover:brightness-110">
              {t.sections.seeAll}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((prod) => (
              <SharedProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {showBestSellers && <BestSellersSection title={t.sections.bestSellers} searchQuery={currentSearch} />}
      {showOffers && <OffersSection title={t.home.latestOffers} />}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      {showFooter && (
        <footer className="bg-[var(--bs-surface)] border-t border-[var(--bs-border)] pt-16 pb-8 text-xs text-[var(--bs-text-muted)] mt-16">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[var(--bs-border)]">
            
            <div>
              {(footer.logo || logoUrl) && (
                <img src={footer.logo || logoUrl || undefined} alt={storeName || 'Store logo'} className="h-10 w-auto object-contain mb-4" />
              )}
              <h4 className="font-bold text-[var(--bs-text)] text-sm mb-4">{t.sections.contactUs}</h4>
              {contactInfo?.address && <p className="mb-2"><strong>{t.sections.contactAddress}</strong> {contactInfo.address}</p>}
              {contactInfo?.email && <p className="mb-2"><strong>{t.sections.emailLabel}</strong> {contactInfo.email}</p>}
              {contactInfo?.phone && <p className="mb-4"><strong>{t.sections.phoneLabel}</strong> {contactInfo.phone}</p>}
              <div className="flex gap-3 text-[var(--bs-text)]">
                <a href={socialLinks.facebook || '#'} aria-label="Facebook"><Facebook size={16} /></a>
                <a href={socialLinks.twitter || '#'} aria-label="Twitter"><Twitter size={16} /></a>
                <a href={socialLinks.instagram || '#'} aria-label="Instagram"><Instagram size={16} /></a>
                <a href={socialLinks.youtube || '#'} aria-label="YouTube"><Youtube size={16} /></a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[var(--bs-text)] text-sm mb-4">{t.sections.quickLinks}</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:opacity-70">{t.sections.privacyPolicy}</Link></li>
                <li><Link href="/terms" className="hover:opacity-70">{t.sections.termsConditions}</Link></li>
                <li><Link href="/purchasing" className="hover:opacity-70">{t.sections.purchasingPolicy}</Link></li>
                <li><Link href="/cookie" className="hover:opacity-70">{t.sections.cookiePolicy}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[var(--bs-text)] text-sm mb-4">{t.sections.company}</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:opacity-70">{t.sections.aboutUs}</Link></li>
                <li><Link href="/career" className="hover:opacity-70">{t.sections.career}</Link></li>
                <li><Link href="/affiliate" className="hover:opacity-70">{t.sections.affiliate}</Link></li>
                <li><Link href="/contact" className="hover:opacity-70">{t.sections.contactUsLower}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[var(--bs-text)] text-sm mb-4">{t.sections.subscribeNewsletter}</h4>
              {footer.bio && <p className="mb-4 text-[var(--bs-text-muted)]">{footer.bio}</p>}
              <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                <input
                  type="email"
                  placeholder={t.sections.emailAddressPlaceholder}
                  className="w-full px-3 py-2 border border-[var(--bs-border)] bg-transparent text-[var(--bs-text)] placeholder:text-[var(--bs-text-muted)] rounded text-xs outline-none focus:border-[var(--bs-text)]"
                />
                <button type="submit" className="w-full bg-[var(--bs-primary)] text-[var(--bs-on-primary)] font-bold text-xs uppercase py-2.5 rounded">
                  {t.sections.submit}
                </button>
              </form>
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto px-6 pt-6 text-xs text-[var(--bs-text-muted)]">
            <p>{footer.copyright && `${footer.copyright} `}<span className="text-[var(--bs-text)] font-bold">{storeName}</span></p>
          </div>
        </footer>
      )}
    </div>
  );
}

// ── 2. Dynamic Feature Banners Grid ─────────────────────────────────────
function FeatureBannersGrid({ banners, primaryColor }: { banners: Banner[]; primaryColor: string }) {
  const { t } = useTranslation();
  if (banners.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-6 pt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => {
          const title = banner.title || banner.name?.filter(Boolean).join(' ');
          const description = banner.description || '';
          const image = banner.images?.[0];

          return (
            <Link
              key={banner._id}
              href="/categories"
              className="relative min-h-[240px] overflow-hidden rounded-2xl border border-[var(--bs-border)] bg-[var(--bs-secondary)] p-6 text-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              {image && (
                <img src={image} alt={title || 'Banner'} className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 flex min-h-[190px] flex-col justify-end gap-2">
                {title && <h3 className="text-xl font-black leading-tight">{title}</h3>}
                {description && <p className="text-sm text-white/80">{description}</p>}
                <span className="mt-2 inline-flex w-fit rounded-lg px-4 py-2 text-xs font-bold uppercase" style={{ backgroundColor: primaryColor, color: 'var(--bs-on-primary)' }}>
                  {t.sections.viewCollection}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// Legacy implementation retained below for reference only.
function LegacyFeatureBannersGrid({ banners = [], primaryColor = '#d9232d' }: { banners: Banner[]; primaryColor?: string }) {
  const b1 = banners[0]; // Top Left (Cyan)
  const b2 = banners[1]; // Bottom Left (Pink)
  const b3 = banners[2]; // Middle Tall (Light Grey)
  const b4 = banners[3]; // Top Right (Light Grey)
  const b5 = banners[4]; // Bottom Right (Purple)

  const btnStyle = { backgroundColor: primaryColor };

  const pickBannerTitle = (banner: Banner | undefined, fallback: string) => {
    const title = banner?.title?.trim();
    if (title) return title;

    const name = Array.isArray(banner?.name) ? banner.name.filter(Boolean).join(' ').trim() : '';
    return name || fallback;
  };

  const pickBannerSubtitle = (banner: Banner | undefined, fallback: string) => {
    const description = banner?.description?.trim();
    if (description) return description;

    const name = Array.isArray(banner?.name) ? banner.name.filter(Boolean).join(' ').trim() : '';
    return name || fallback;
  };

  return (
    <section className="max-w-[1400px] mx-auto px-6 pt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (2 Banners) */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#41c5ea] rounded-sm p-6 flex items-center justify-between min-h-[195px] relative overflow-hidden shadow-sm">
            <div className="z-10 space-y-1.5 max-w-[55%]">
              <h3 className="text-2xl font-black text-[var(--bs-text)] leading-none">{pickBannerTitle(b1, 'New')}</h3>
              <p className="text-sm font-bold text-[var(--bs-text)] mb-3">{pickBannerSubtitle(b1, 'Collection')}</p>
              <Link href="/products" style={btnStyle} className="inline-block text-white text-[10px] font-extrabold uppercase px-4 py-2 rounded shadow hover:brightness-110 transition-all">
                SHOP NOW
              </Link>
            </div>
            <img src={b1?.images?.[0] || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400'} alt="Banner 1" className="w-36 h-36 object-contain drop-shadow-md" />
          </div>

          <div className="bg-[#ff7ba9] rounded-sm p-6 flex items-center justify-between min-h-[195px] relative overflow-hidden shadow-sm">
            <div className="z-10 space-y-1.5 max-w-[55%]">
              <h3 className="text-2xl font-black text-[var(--bs-text)] leading-none">{pickBannerTitle(b2, 'Hot')}</h3>
              <p className="text-sm font-bold text-[var(--bs-text)] mb-3">{pickBannerSubtitle(b2, 'Collection')}</p>
              <Link href="/products" style={btnStyle} className="inline-block text-white text-[10px] font-extrabold uppercase px-4 py-2 rounded shadow hover:brightness-110 transition-all">
                SHOP NOW
              </Link>
            </div>
            <img src={b2?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400'} alt="Banner 2" className="w-36 h-36 object-contain drop-shadow-md" />
          </div>
        </div>

        {/* Middle Column (Tall Banner) */}
        <div className="bg-[#eaeaea] rounded-sm p-6 flex flex-col justify-between min-h-[414px] shadow-sm">
          <div className="w-full flex justify-center items-center flex-1 pt-2">
            <img src={b3?.images?.[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=500'} alt="Middle Banner" className="max-h-56 object-contain drop-shadow-md" />
          </div>
          <div className="w-full text-left pt-4 border-t border-gray-200/60">
            <h3 className="text-2xl font-black text-[var(--bs-primary,#d9232d)] leading-tight">{pickBannerTitle(b3, '10% Offer')}</h3>
            <p className="text-xs font-bold text-slate-800 mb-3">{pickBannerSubtitle(b3, 'No Selected Models')}</p>
            <Link href="/products" style={btnStyle} className="inline-block text-white text-[10px] font-extrabold uppercase px-4 py-2 rounded shadow hover:brightness-110 transition-all">
              SHOP NOW
            </Link>
          </div>
        </div>

        {/* Right Column (2 Banners) */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#eaeaea] rounded-sm p-6 flex items-center justify-between min-h-[195px] relative overflow-hidden shadow-sm">
            <div className="z-10 space-y-1.5 max-w-[55%]">
              <h3 className="text-2xl font-black text-[var(--bs-text)] leading-none">{pickBannerTitle(b4, 'New')}</h3>
              <p className="text-sm font-bold text-[var(--bs-text)] mb-3">{pickBannerSubtitle(b4, 'Arrivals')}</p>
              <Link href="/products" style={btnStyle} className="inline-block text-white text-[10px] font-extrabold uppercase px-4 py-2 rounded shadow hover:brightness-110 transition-all">
                SHOP NOW
              </Link>
            </div>
            <img src={b4?.images?.[0] || 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&q=80&w=400'} alt="Banner 4" className="w-36 h-36 object-contain drop-shadow-md" />
          </div>

          <div className="bg-[#c48ceb] rounded-sm p-6 flex items-center justify-between min-h-[195px] relative overflow-hidden shadow-sm">
            <div className="z-10 space-y-1.5 max-w-[55%]">
              <h3 className="text-2xl font-black text-[var(--bs-text)] leading-none">{pickBannerTitle(b5, 'Hot')}</h3>
              <p className="text-sm font-bold text-[var(--bs-text)] mb-3">{pickBannerSubtitle(b5, 'Offer')}</p>
              <Link href="/products" style={btnStyle} className="inline-block text-white text-[10px] font-extrabold uppercase px-4 py-2 rounded shadow hover:brightness-110 transition-all">
                SHOP NOW
              </Link>
            </div>
            <img src={b5?.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400'} alt="Banner 5" className="w-36 h-36 object-contain drop-shadow-md" />
          </div>
        </div>

      </div>
    </section>
  );
}