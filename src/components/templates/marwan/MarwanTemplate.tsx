'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Loader2,
  Moon,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Truck,
  Undo2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Layers,
  CheckCircle2,
  PackageCheck,
  LogIn,
  User
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGet } from '@/hooks/useGet';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';
import { useTranslation } from '@/hooks/useTranslation';
import StoreLoader from '@/components/common/StoreLoader';
import { ApiResponse, Banner, Category, Product, Brand } from '@/types/api';

interface MarwanTemplateProps {
  searchQuery?: string;
  excludeKeys?: string[];
  className?: string;
}

const REVEAL_HIDDEN = 'opacity-0 translate-y-7';
const REVEAL_SHOWN = 'opacity-100 translate-y-0';
const REVEAL_BASE = 'transition-all duration-700 ease-out';

function sectionEnabled(sections: any[] | undefined, key: string, fallback = true) {
  if (!Array.isArray(sections) || sections.length === 0) return fallback;
  const found = sections.find((s) => s?.key === key);
  return found ? found.enabled !== false : fallback;
}

function googleFontParam(fontStyle?: string) {
  const family = (fontStyle || 'Amiri').trim() || 'Amiri';
  return family.replace(/\s+/g, '+');
}

export default function MarwanTemplate({
  searchQuery = '',
  excludeKeys = [],
  className = '',
}: MarwanTemplateProps) {
  const { colors, sections, storeName, logoUrl, fontStyle, settings, themeMode, toggleTheme, language, toggleLanguage } = useStoreSettings() as any;
  const { t, isRtl, getLocalized, formatPrice } = useTranslation();
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);

  // Real backend API calls
  const { data: bannersData, isLoading: bannersLoading } = useGet<ApiResponse<Banner>>(['banners'], '/banner');
  const { data: categoriesData, isLoading: categoriesLoading } = useGet<ApiResponse<Category>>(['categories'], '/category');
  const { data: productsData, isLoading: productsLoading } = useGet<ApiResponse<Product>>(['products'], '/product');
  const { data: brandsData, isLoading: brandsLoading } = useGet<ApiResponse<Brand>>(['brands'], '/brand');

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [searchText, setSearchText] = useState(searchQuery || '');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');

  useEffect(() => {
    setSearchText(searchQuery || '');
  }, [searchQuery]);

  const activeSearch = searchText.trim().toLowerCase();

  const showHero = sectionEnabled(sections, 'hero');
  const showFeatures = sectionEnabled(sections, 'features');
  const showCategories = sectionEnabled(sections, 'categories');
  const showProducts = sectionEnabled(sections, 'products');
  const showBrands = sectionEnabled(sections, 'brands');
  const showFooter = sectionEnabled(sections, 'footer');

  // Real Ecommerce Data from Backend
  const ecomData = settings?.ecommerceData?.[0] || (settings as any)?.ecommerceUsers?.[0] || {};
  const contactLinks = ecomData.social_links || {};
  const headerData = ecomData.header || {};
  const footerData = ecomData.footer || {};
  const hasContactInfo = Boolean(ecomData.name || ecomData.email || ecomData.phone || ecomData.address || Object.keys(contactLinks).length);

  const displayStoreName = storeName || headerData.title || 'STORE';
  const displayLogo = footerData.logo || logoUrl || headerData.logo || '';
  const announcementText: string = headerData.announcement || '';

  // Dynamic nav links from backend
  const headerLinks: string[] = headerData?.links || [];
  const linkConfig: Record<string, { label: string; href: string; scrollId?: string }> = {
    home:             { label: t.nav.home,       href: '/' },
    about:            { label: t.nav.about,      href: '/about' },
    products:         { label: t.nav.products,   href: '/product', scrollId: 'all-products' },
    product:          { label: t.nav.products,   href: '/product', scrollId: 'all-products' },
    categories:       { label: t.nav.categories, href: '/categories', scrollId: 'categories' },
    category:         { label: t.nav.categories, href: '/categories', scrollId: 'categories' },
    brands:           { label: t.nav.brands,     href: '/brands', scrollId: 'brands' },
    brand:            { label: t.nav.brands,     href: '/brands', scrollId: 'brands' },
    'track-order':    { label: t.nav.trackOrder, href: '/order-tracking' },
    'order-tracking': { label: t.nav.trackOrder, href: '/order-tracking' },
    'why-us':         { label: t.nav.whyUs,      href: '#why-us', scrollId: 'why-us' },
    contact:          { label: t.nav.contact,    href: '#store-connect', scrollId: 'store-connect' },
  };

  const isDarkMode = themeMode === 'dark';
  const activePrimary = isDarkMode ? colors?.primaryDark || colors?.primary : colors?.primary;
  const activeSecondary = isDarkMode ? colors?.secondaryDark || colors?.secondary : colors?.secondary;
  const activeBackground = isDarkMode ? colors?.backgroundDark || colors?.background : colors?.background;
  const activeTextPrimary = isDarkMode ? colors?.textPrimaryDark || colors?.textPrimary : colors?.textPrimary;
  const activeTextSecondary = isDarkMode ? colors?.textSecondaryDark || colors?.textSecondary : colors?.textSecondary;

  /* ── Theme variables driven directly by backend settings ── */
  const themeVars = {
    ['--mw-primary' as any]: activePrimary || '#e6a817',
    ['--mw-secondary' as any]: activeSecondary || '#111827',
    ['--mw-bg' as any]: activeBackground || '#ffffff',
    ['--mw-text' as any]: activeTextPrimary || '#111827',
    ['--mw-text-muted' as any]: activeTextSecondary || '#6b7280',
    ['--mw-font' as any]: fontStyle ? `'${fontStyle}', sans-serif` : 'inherit',
    ['--mw-surface' as any]: 'color-mix(in srgb, var(--mw-bg) 96%, var(--mw-text) 4%)',
    ['--mw-surface-2' as any]: 'color-mix(in srgb, var(--mw-bg) 92%, var(--mw-text) 8%)',
    ['--mw-border' as any]: 'color-mix(in srgb, var(--mw-text) 12%, transparent)',
  } as React.CSSProperties;

  const fontQuery = useMemo(() => googleFontParam(fontStyle), [fontStyle]);

  /* ── Fixed header + scroll-spy ── */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const ids = ['categories', 'featured-products', 'all-products', 'brands', 'why-us', 'store-connect'];
      let current = 'home';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 220) current = id;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Scroll-reveal ── */
  useEffect(() => {
    const els = document.querySelectorAll('.mw-tpl [data-reveal]');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove(...REVEAL_HIDDEN.split(' '));
            entry.target.classList.add(...REVEAL_SHOWN.split(' '));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [bannersLoading, categoriesLoading, productsLoading, brandsLoading]);

  /* ── Data shaping from Backend ── */
  const allBanners = useMemo(() => bannersData?.data?.data || [], [bannersData]);

  const heroBanner = useMemo(() => {
    return allBanners.find((b) => b.name?.some((n) => /home|hero|main/i.test(String(n)))) || allBanners[0];
  }, [allBanners]);

  const secondaryBanner = useMemo(() => {
    return allBanners.find((b) => b._id !== heroBanner?._id && b.isActive !== false) || null;
  }, [allBanners, heroBanner]);

  const heroImages = heroBanner?.images?.length
    ? heroBanner.images
    : ['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1600'];

  const categories = useMemo(() => {
    const list = categoriesData?.data?.data || [];
    const q = activeSearch;
    return q
      ? list.filter((c) => c.name?.toLowerCase().includes(q) || c.ar_name?.toLowerCase().includes(q))
      : list;
  }, [categoriesData, activeSearch]);

  const allProductsList = useMemo(() => productsData?.data?.data || [], [productsData]);

  const searchedProducts = useMemo(() => {
    const q = activeSearch;
    return q
      ? allProductsList.filter((p) => p.name?.toLowerCase().includes(q) || p.ar_name?.toLowerCase().includes(q) || p.brand?.name?.toLowerCase().includes(q))
      : allProductsList;
  }, [allProductsList, activeSearch]);

  const featuredProducts = useMemo(() => {
    const featured = searchedProducts.filter((p) => p.is_featured);
    return featured.length > 0 ? featured : searchedProducts.slice(0, 4);
  }, [searchedProducts]);

  const tabFilteredProducts = useMemo(() => {
    if (selectedCategoryTab === 'all') return searchedProducts;
    return searchedProducts.filter((p) =>
      p.categories?.some((c) => c._id === selectedCategoryTab || c.name?.toLowerCase() === selectedCategoryTab.toLowerCase()) ||
      p.categoryId?.some((c) => c._id === selectedCategoryTab || c.name?.toLowerCase() === selectedCategoryTab.toLowerCase()) ||
      (p.category && (p.category._id === selectedCategoryTab || p.category.name?.toLowerCase() === selectedCategoryTab.toLowerCase()))
    );
  }, [searchedProducts, selectedCategoryTab]);

  const brands = useMemo(() => brandsData?.data?.data || [], [brandsData]);

  const featuredCategoryBanner = useMemo(() => {
    return categories.find((c) => c.banner && c.banner.length > 5 && c.banner.startsWith('http')) || null;
  }, [categories]);

  const matchingBrand = useMemo(() => {
    if (activeSearch.length < 2) return undefined;
    const matches = (brand: Brand) =>
      [brand.name, brand.ar_name].some((name) => name?.toLowerCase().includes(activeSearch));
    return brands.find((brand) =>
      [brand.name, brand.ar_name].some((name) => name?.toLowerCase() === activeSearch)
    ) || brands.find(matches);
  }, [brands, activeSearch]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (matchingBrand) {
      router.push(`/brands#${matchingBrand._id}`);
    }
  };

  useEffect(() => {
    if (!activeSearch) return;
    if (showCategories && categories.length > 0) {
      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (showProducts && searchedProducts.length > 0) {
      document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSearch, showCategories, showProducts, categories.length, searchedProducts.length]);

  const priceText = (product: Product) => {
    const raw = product.final_price ?? product.main_price ?? product.price ?? 0;
    return formatPrice ? formatPrice(raw) : `EGP ${Number(raw).toLocaleString()}`;
  };

  const isLoading = bannersLoading || categoriesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <StoreLoader logoUrl={logoUrl} label={t?.common?.loadingStore || 'Loading...'} size="lg" />
      </div>
    );
  }

  // Build nav items: dynamic from backend or fallback
  const fallbackNavKeys = ['categories', 'featured-products', 'all-products', 'brands', 'why-us', 'store-connect'];
  const navItems = headerLinks.length
    ? headerLinks.map((key) => {
        const normalized = key.toLowerCase().trim();
        const found = linkConfig[normalized];
        return found
          ? { key: normalized, label: found.label, href: found.scrollId ? `#${found.scrollId}` : found.href }
          : { key: normalized, label: normalized.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()), href: `/${normalized}` };
      })
    : [
        { key: 'categories', label: t?.nav?.categories || 'Categories', href: '#categories', enabled: showCategories && categories.length > 0 },
        { key: 'featured-products', label: t?.nav?.products || 'Featured', href: '#featured-products', enabled: showProducts && featuredProducts.length > 0 },
        { key: 'all-products', label: 'All Products', href: '#all-products', enabled: showProducts && allProductsList.length > 0 },
        { key: 'brands', label: t?.nav?.brands || 'Brands', href: '#brands', enabled: showBrands && brands.length > 0 },
        { key: 'why-us', label: t?.nav?.whyUs || 'Why Us', href: '#why-us', enabled: showFeatures },
        { key: 'store-connect', label: t?.nav?.contact || 'Contact', href: '#store-connect', enabled: hasContactInfo },
      ].filter((item: any) => item.enabled !== false);

  const navLinkCls = (active: boolean) =>
    `text-[13px] font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors ${
      active
        ? 'border-[var(--mw-primary)] text-[var(--mw-text)]'
        : 'border-transparent text-[var(--mw-text-muted)] hover:text-[var(--mw-text)]'
    }`;

  const dynamicTrustPerks = [
    {
      icon: Truck,
      title: announcementText ? (t?.home?.fastDelivery || 'Fast Delivery') : 'Express Shipping',
      desc: announcementText || (t?.sections?.fastDeliveryWhyUs || 'Nationwide secure delivery directly to your doorstep.'),
    },
    {
      icon: ShieldCheck,
      title: t?.home?.securePayment || '100% Authentic Brands',
      desc: brands.length > 0 ? `Official partner for ${brands.map((b) => b.name).filter(Boolean).slice(0, 3).join(', ')}` : (t?.sections?.securePaymentsWhyUs || 'Sourced directly from authorized distributors.'),
    },
    {
      icon: Undo2,
      title: t?.home?.easyReturns || 'Hassle-Free Returns',
      desc: t?.sections?.easyReturnsWhyUs || '14 days easy return guarantee on eligible products.',
    },
    {
      icon: PackageCheck,
      title: t?.home?.qualityGuaranteed || 'Dedicated Support',
      desc: ecomData.phone ? `Call us at ${ecomData.phone} or chat directly via WhatsApp.` : (t?.sections?.curatedQualityWhyUs || 'Reliable customer care and assistance.'),
    },
  ];

  return (
    <div className={`mw-tpl w-full max-w-full overflow-x-hidden m-0 p-0 ${className}`} style={themeVars}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${fontQuery}:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes mwGlow { from { opacity: .5; transform: scale(1); } to { opacity: 1; transform: scale(1.12); } }
        @keyframes mwFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
      `}</style>

      <div style={{ fontFamily: 'var(--mw-font)', background: 'var(--mw-bg)', color: 'var(--mw-text)' }} className="w-full pt-[72px]">
        {/* ── Top Announcement Bar ── */}
        {announcementText && (
          <div
            className="fixed inset-x-0 top-0 z-[55] text-xs font-bold py-1.5 px-4 text-center transition-all flex items-center justify-center gap-2"
            style={{ background: 'var(--mw-primary)', color: 'var(--mw-secondary)' }}
          >
            <Sparkles size={13} />
            <span>{announcementText}</span>
          </div>
        )}

        {/* ── Header ── */}
        <header
          className={`fixed inset-x-0 ${announcementText ? 'top-[28px]' : 'top-0'} z-50 transition-all duration-300 ${scrolled ? 'shadow-lg backdrop-blur-md' : ''}`}
          style={{
            background: 'color-mix(in srgb, var(--mw-secondary) 96%, black 4%)',
            borderBottom: '1px solid color-mix(in srgb, var(--mw-primary) 45%, transparent)',
          }}
        >
          <div className="max-w-[1460px] mx-auto px-4 flex items-center justify-between h-[72px] gap-4">
            <Link href="/" className="flex h-14 w-[150px] md:w-[220px] items-center shrink-0" aria-label={displayStoreName}>
              {displayLogo ? (
                <img src={displayLogo} alt={displayStoreName} className="max-h-14 max-w-full object-contain object-left" />
              ) : (
                <span className="text-[28px] md:text-[36px] font-black uppercase tracking-tight leading-none" style={{ color: 'var(--mw-primary)' }}>
                  {displayStoreName}
                </span>
              )}
            </Link>

            <div className="hidden md:flex flex-1 justify-center px-3">
              <form onSubmit={handleSearchSubmit} className="relative flex w-full max-w-[460px] items-center gap-3 rounded-full border px-4 py-2" style={{ background: 'color-mix(in srgb, var(--mw-bg) 18%, transparent)', borderColor: 'color-mix(in srgb, var(--mw-primary) 35%, transparent)' }}>
                <span style={{ color: 'var(--mw-text-muted)' }}>⌕</span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={t?.common?.searchPlaceholder || 'Search products, categories, or brands...'}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--mw-text-muted)]"
                  style={{ color: 'var(--mw-text)' }}
                />
                {matchingBrand && (
                  <Link href={`/brands#${matchingBrand._id}`} className="absolute inset-x-0 top-full z-50 mt-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold text-gray-800 shadow-lg">
                    {getLocalized ? getLocalized(matchingBrand) : matchingBrand.name} <span className="font-normal text-gray-500">— {t?.nav?.brands || 'Brands'}</span>
                  </Link>
                )}
              </form>
            </div>

            <nav className="hidden lg:flex items-center justify-center gap-6 shrink-0">
              {navItems.map((item) => (
                <Link key={item.key} href={item.href} className={navLinkCls(activeSection === item.key)}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              {/* Login / Profile */}
              <Link
                href={token ? '/profile' : '/login'}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-3 text-[11px] font-black uppercase tracking-wider transition-all hover:scale-105"
                style={{ borderColor: 'var(--mw-primary)', color: 'var(--mw-primary)' }}
                title={token ? (t?.nav?.profile || 'Profile') : (t?.nav?.login || 'Login')}
              >
                {token ? <User size={15} /> : <LogIn size={15} />}
                <span className="hidden sm:inline">
                  {token ? (t?.nav?.profile || 'Profile') : (t?.nav?.login || 'Login')}
                </span>
              </Link>
              {/* Language toggle */}
              {toggleLanguage && (
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="hidden sm:inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-[10px] font-black transition-all duration-300 hover:scale-105"
                  style={{ borderColor: 'var(--mw-primary)', color: 'var(--mw-primary)' }}
                >
                  {(language || 'AR').toUpperCase()}
                </button>
              )}
              {/* Dark mode toggle */}
              {toggleTheme && (
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105"
                  style={{ borderColor: 'var(--mw-primary)', color: 'var(--mw-primary)' }}
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              )}
              {contactLinks.whatsapp && (
                <a
                  href={contactLinks.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}
              <Link
                href="/categories"
                className="hidden md:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-[12px] font-extrabold uppercase tracking-wider transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--mw-primary)', color: 'var(--mw-secondary)' }}
              >
                {t?.home?.shopNow || 'Shop Now'} →
              </Link>
            </div>

            <button
              className="lg:hidden text-2xl leading-none"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
              style={{ color: 'var(--mw-text)' }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>

          {menuOpen && (
            <div className="lg:hidden max-w-[1240px] mx-auto px-5 pb-4 flex flex-col gap-3">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-full border px-3 py-2" style={{ background: 'var(--mw-bg)', borderColor: 'var(--mw-border)' }}>
                <span style={{ color: 'var(--mw-text-muted)' }}>⌕</span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={t?.common?.search || 'Search...'}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--mw-text-muted)]"
                  style={{ color: 'var(--mw-text)' }}
                />
              </form>
              {navItems.map((item) => (
                <Link key={item.key} href={item.href} onClick={() => setMenuOpen(false)} className="text-sm font-bold uppercase py-1">
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* ── Section 1: Hero Banner ── */}
        {showHero && (
          <section className="relative min-h-[82vh] flex items-center overflow-hidden" style={{ background: 'var(--mw-secondary)' }}>
            {heroImages[0] && (
              <div className="absolute inset-0 z-0">
                <img
                  src={heroImages[0]}
                  alt={heroBanner?.title || displayStoreName}
                  className="w-full h-full object-cover brightness-[.45] saturate-[1.1]"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, color-mix(in srgb, var(--mw-secondary) 85%, black) 10%, color-mix(in srgb, var(--mw-secondary) 30%, transparent) 60%, transparent 100%)' }} />
              </div>
            )}

            <div className="absolute top-[8%] left-[4%] w-[600px] h-[600px] z-[1] pointer-events-none rounded-full [animation:mwGlow_4s_ease-in-out_infinite_alternate]" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--mw-primary) 22%, transparent) 0%, transparent 70%)' }} />

            <div className="relative z-[2] w-full max-w-[1240px] mx-auto px-5 py-12">
              <div className={`grid gap-8 items-center ${displayLogo ? 'md:grid-cols-[1.1fr_0.9fr]' : 'grid-cols-1'}`}>
                <div data-reveal className={`${REVEAL_BASE} ${REVEAL_SHOWN}`}>
                  <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--mw-primary)' }}>
                    <span className="w-6 h-0.5" style={{ background: 'var(--mw-primary)' }} />
                    {t?.home?.welcomeTo || 'Welcome to'} {displayStoreName}
                  </div>

                  <h1 className="text-[2.6rem] md:text-[3.8rem] lg:text-[4.8rem] font-black leading-[1.0] uppercase tracking-tight text-white mb-5">
                    {heroBanner?.title ? (
                      <>
                        Discover The{' '}
                        <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, color-mix(in srgb, var(--mw-primary) 70%, white), var(--mw-primary))' }}>
                          {heroBanner.title}
                        </span>{' '}
                        Lineup
                      </>
                    ) : (
                      <>
                        Shop Premium{' '}
                        <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, color-mix(in srgb, var(--mw-primary) 70%, white), var(--mw-primary))' }}>
                          Collections
                        </span>
                      </>
                    )}
                  </h1>

                  <p className="max-w-[480px] text-base leading-[1.8] text-white/85 mb-8">
                    {heroBanner?.description || footerData.bio || (t?.home?.heroSubtitle || 'Curated high-quality products directly from verified official distributors.')}
                  </p>

                  <div className="flex flex-wrap gap-4 mb-10">
                    <Link href="#featured-products" className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-extrabold text-[13px] uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5 shadow-xl" style={{ background: 'var(--mw-primary)', boxShadow: '0 16px 36px color-mix(in srgb, var(--mw-primary) 40%, transparent)' }}>
                      {t?.home?.shopNow || 'Shop Products'} <ArrowRight size={17} className={isRtl ? 'rotate-180' : ''} />
                    </Link>
                    {categories.length > 0 && (
                      <Link href="#categories" className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-extrabold text-[13px] uppercase tracking-wider text-white bg-white/10 border border-white/30 transition-transform hover:-translate-y-0.5 hover:border-white backdrop-blur-sm">
                        {t?.home?.browseCategories || 'Explore Categories'}
                      </Link>
                    )}
                  </div>

                  <div className="flex gap-8 pt-6 border-t border-white/15">
                    <div>
                      <b className="block text-3xl font-black" style={{ color: 'var(--mw-primary)' }}>{categories.length || '—'}</b>
                      <span className="block mt-1 text-[11px] font-semibold tracking-wider uppercase text-white/70">{t?.sections?.categoryCountLabel || 'Categories'}</span>
                    </div>
                    <div>
                      <b className="block text-3xl font-black" style={{ color: 'var(--mw-primary)' }}>{allProductsList.length || '—'}</b>
                      <span className="block mt-1 text-[11px] font-semibold tracking-wider uppercase text-white/70">{t?.sections?.productCountLabel || 'Products'}</span>
                    </div>
                    {brands.length > 0 && (
                      <div>
                        <b className="block text-3xl font-black" style={{ color: 'var(--mw-primary)' }}>{brands.length}</b>
                        <span className="block mt-1 text-[11px] font-semibold tracking-wider uppercase text-white/70">{t?.nav?.brands || 'Official Brands'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {displayLogo && (
                  <div data-reveal className={`${REVEAL_BASE} ${REVEAL_SHOWN} flex items-center justify-center md:justify-end order-first md:order-last`} aria-hidden="true">
                    <img src={displayLogo} alt={displayStoreName || 'Logo'} className="w-[60%] md:w-[85%] max-w-[360px] h-auto object-contain [animation:mwFloat_5s_ease-in-out_infinite]" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,.6))' }} />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ background: 'var(--mw-primary)', color: 'var(--mw-secondary)' }}>
          {[
            { v: categories.length, l: t?.sections?.categoryCountLabel || 'Categories' },
            { v: allProductsList.length, l: t?.sections?.productCountLabel || 'Products' },
            { v: brands.length > 0 ? `${brands.length} Brands` : 'Authentic', l: 'Verified Quality' },
            { v: '14 Days', l: t?.home?.easyReturns || 'Free Return' },
          ].map((s, i) => (
            <div key={s.l} className={`text-center py-6 px-4 border-black/10 hover:bg-black/5 transition-colors ${i < 3 ? 'border-r' : ''}`}>
              <b className="block text-2xl md:text-3xl font-black">{s.v}</b>
              <small className="block mt-0.5 text-[10px] md:text-[11px] font-bold tracking-wider uppercase opacity-85">{s.l}</small>
            </div>
          ))}
        </div>

        {/* ── Section 2: Categories ── */}
        {showCategories && categories.length > 0 && (
          <section className="py-12 md:py-16 max-w-[1240px] mx-auto px-5" id="categories">
            <div data-reveal className={`${REVEAL_BASE} ${REVEAL_SHOWN} flex flex-wrap items-end justify-between gap-4 mb-8`}>
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--mw-primary)' }}>
                  <span className="w-[22px] h-0.5" style={{ background: 'var(--mw-primary)' }} /> {t?.sections?.curatedCollections || 'Store Collections'}
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                  {t?.sections?.shopBy || 'Shop by'} <span style={{ color: 'var(--mw-primary)' }}>{t?.nav?.categories || 'category'}</span>
                </h2>
              </div>
              <Link href="/categories" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border text-[11px] font-extrabold uppercase tracking-wider hover:border-black transition-colors" style={{ borderColor: 'var(--mw-border)' }}>
                {t?.common?.viewAll || 'View all'} ({categories.length}) <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {categories.map((category, i) => (
                <Link
                  key={category._id}
                  href={`/categories?id=${category._id}`}
                  data-reveal
                  style={{ transitionDelay: `${(i % 4) * 80}ms`, borderColor: 'var(--mw-border)', background: 'var(--mw-surface)' }}
                  className={`${REVEAL_BASE} ${REVEAL_SHOWN} group relative rounded-2xl overflow-hidden border hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl`}
                >
                  <div className="relative h-[220px] overflow-hidden bg-gray-100">
                    {category.image ? (
                      <img src={category.image} alt={getLocalized ? getLocalized(category, 'name') : category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Layers size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  </div>

                  <div className="absolute left-0 right-0 bottom-0 p-5 text-white">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 backdrop-blur-md mb-2 inline-block">
                      {category.product_quantity ?? 0} {t?.common?.itemsCount || 'items'}
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-0.5">{getLocalized ? getLocalized(category, 'name') : category.name}</h3>
                    {category.ar_name && !isRtl && <p className="text-xs text-white/80 font-medium">{category.ar_name}</p>}
                  </div>

                  <div className="absolute left-0 bottom-0 h-[3px] w-full scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300" style={{ background: 'var(--mw-primary)' }} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Section 3: Promotional Spotlight ── */}
        {(secondaryBanner || featuredCategoryBanner) && (
          <section className="py-6 max-w-[1240px] mx-auto px-5">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl p-8 md:p-12 text-white border" style={{ borderColor: 'var(--mw-border)', background: 'linear-gradient(135deg, color-mix(in srgb, var(--mw-secondary) 95%, black), color-mix(in srgb, var(--mw-secondary) 85%, var(--mw-primary)))' }}>
              {(secondaryBanner?.images?.[0] || featuredCategoryBanner?.banner) && (
                <div className="absolute inset-0 z-0">
                  <img src={secondaryBanner?.images?.[0] || featuredCategoryBanner?.banner} alt={secondaryBanner?.title || featuredCategoryBanner?.name || 'Promotional Banner'} className="w-full h-full object-cover brightness-[.35]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                </div>
              )}
              <div className="relative z-10 max-w-xl">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-4" style={{ background: 'var(--mw-primary)', color: 'var(--mw-secondary)' }}>
                  <Sparkles size={14} /> Official Spotlight Deal
                </span>
                <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
                  {secondaryBanner?.title || featuredCategoryBanner?.name}
                </h3>
                <p className="text-sm md:text-base text-gray-200 leading-relaxed mb-6 font-medium">
                  {secondaryBanner?.description || (featuredCategoryBanner?.ar_name ? `Explore all official products in ${featuredCategoryBanner.name} (${featuredCategoryBanner.ar_name}) with exclusive store rates.` : 'Explore verified store collections with full warranty and express shipping.')}
                </p>
                <Link
                  href={featuredCategoryBanner ? `/categories?id=${featuredCategoryBanner._id}` : '#featured-products'}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5"
                  style={{ background: 'var(--mw-primary)', color: 'var(--mw-secondary)' }}
                >
                  Explore Spotlight <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Section 4: Featured Products ── */}
        {showProducts && featuredProducts.length > 0 && (
          <section className="py-12 md:py-16 max-w-[1240px] mx-auto px-5" id="featured-products">
            <div data-reveal className={`${REVEAL_BASE} ${REVEAL_SHOWN} flex flex-wrap items-end justify-between gap-4 mb-8`}>
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--mw-primary)' }}>
                  <span className="w-[22px] h-0.5" style={{ background: 'var(--mw-primary)' }} /> {t?.sections?.bestPicks || 'Handpicked Selection'}
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                  {t?.sections?.featuredLabel || 'Featured'} <span style={{ color: 'var(--mw-primary)' }}>{t?.nav?.products || 'products'}</span>
                </h2>
              </div>
              <Link href="/product" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border text-[11px] font-extrabold uppercase tracking-wider hover:border-black transition-colors" style={{ borderColor: 'var(--mw-border)' }}>
                {t?.sections?.seeMore || 'All Products'} <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featuredProducts.map((product, i) => (
                <div
                  key={product._id}
                  data-reveal
                  style={{ transitionDelay: `${(i % 4) * 80}ms`, background: 'var(--mw-surface)', borderColor: 'var(--mw-border)' }}
                  className={`${REVEAL_BASE} ${REVEAL_SHOWN} group rounded-2xl overflow-hidden border hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between`}
                >
                  <div className="relative h-[240px] overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                    {product.is_featured && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white z-10" style={{ background: 'var(--mw-primary)', color: 'var(--mw-secondary)' }}>
                        Featured
                      </span>
                    )}
                    {product.brand?.name && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded bg-white/90 border border-gray-100 text-gray-700 z-10">
                        {product.brand.name}
                      </span>
                    )}
                    <img
                      src={product.image || product.gallery_product?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.08]"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-black" style={{ color: 'var(--mw-primary)' }}>{priceText(product)}</span>
                        {product.quantity !== undefined && (
                          <span className={`text-[11px] font-semibold ${product.quantity > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {product.quantity > 0 ? 'In Stock' : 'Out of stock'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold mb-1">{getLocalized ? getLocalized(product, 'name') : product.name}</h3>
                      {product.ar_name && !isRtl && <p className="text-xs text-gray-400 mb-2 font-medium">{product.ar_name}</p>}
                      <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--mw-text-muted)' }}>
                        {getLocalized ? getLocalized(product, 'description') : product.description || 'Premium quality guaranteed.'}
                      </p>
                    </div>
                    <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--mw-border)' }}>
                      <Link href={`/product/${product._id}`} className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider hover:underline" style={{ color: 'var(--mw-primary)' }}>
                        {t?.common?.viewMore || 'View Details'} <ArrowRight size={13} />
                      </Link>
                      <Star size={15} style={{ color: 'var(--mw-primary)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Section 5: All Products with Category Tabs ── */}
        {showProducts && allProductsList.length > 0 && (
          <section className="py-12 md:py-16 max-w-[1240px] mx-auto px-5" id="all-products">
            <div data-reveal className={`${REVEAL_BASE} ${REVEAL_SHOWN} mb-8`}>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--mw-primary)' }}>
                    <span className="w-[22px] h-0.5" style={{ background: 'var(--mw-primary)' }} /> Full Store Inventory
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                    Explore All <span style={{ color: 'var(--mw-primary)' }}>Products</span>
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedCategoryTab('all')}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${selectedCategoryTab === 'all' ? 'shadow-md scale-105' : 'border border-gray-200 text-gray-600 hover:border-black'}`}
                    style={selectedCategoryTab === 'all' ? { background: 'var(--mw-primary)', color: 'var(--mw-secondary)' } : {}}
                  >
                    All ({allProductsList.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategoryTab(cat._id)}
                      className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${selectedCategoryTab === cat._id ? 'shadow-md scale-105' : 'border border-gray-200 text-gray-600 hover:border-black'}`}
                      style={selectedCategoryTab === cat._id ? { background: 'var(--mw-primary)', color: 'var(--mw-secondary)' } : {}}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {tabFilteredProducts.map((product, i) => (
                  <div
                    key={`all-p-${product._id}-${i}`}
                    style={{ background: 'var(--mw-surface)', borderColor: 'var(--mw-border)' }}
                    className="group rounded-2xl overflow-hidden border hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative h-[210px] overflow-hidden bg-gray-50 flex items-center justify-center p-3">
                      <img
                        src={product.image || product.gallery_product?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.08]"
                      />
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base font-black" style={{ color: 'var(--mw-primary)' }}>{priceText(product)}</span>
                          {product.brand?.name && <span className="text-[10px] font-bold text-gray-500 uppercase">{product.brand.name}</span>}
                        </div>
                        <h4 className="text-sm font-extrabold mb-1 line-clamp-1">{getLocalized ? getLocalized(product, 'name') : product.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{getLocalized ? getLocalized(product, 'description') : product.description || 'Official quality product.'}</p>
                      </div>
                      <Link href={`/product/${product._id}`} className="w-full py-2.5 rounded-xl border text-center text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors" style={{ borderColor: 'var(--mw-border)' }}>
                        {t?.common?.viewMore || 'View Product'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Section 6: Brand Partners ── */}
        {showBrands && brands.length > 0 && (
          <section className="py-12 md:py-16 border-y" style={{ background: 'var(--mw-surface)', borderColor: 'var(--mw-border)' }} id="brands">
            <div className="max-w-[1240px] mx-auto px-5">
              <div data-reveal className={`${REVEAL_BASE} ${REVEAL_SHOWN} text-center mb-10`}>
                <span className="text-[11px] font-extrabold tracking-[0.25em] uppercase mb-2 block" style={{ color: 'var(--mw-primary)' }}>Certified Partners</span>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                  Official Brand <span style={{ color: 'var(--mw-primary)' }}>Distributors</span>
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-center">
                {brands.map((brand) => (
                  <Link key={brand._id} href={`/brands#${brand._id}`} className="p-5 rounded-2xl border bg-white flex flex-col items-center justify-center gap-2 hover:shadow-lg hover:border-black transition-all group aspect-square text-center" style={{ borderColor: 'var(--mw-border)' }}>
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name || brand.ar_name} className="max-h-16 max-w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <span className="text-lg font-black text-gray-800">{brand.name}</span>
                    )}
                    <span className="text-xs font-extrabold text-gray-700 mt-1">{brand.name}</span>
                    {brand.ar_name && <span className="text-[10px] text-gray-400 font-medium">{brand.ar_name}</span>}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Section 7: Why Us ── */}
        {showFeatures && (
          <section className="py-12 md:py-16 max-w-[1240px] mx-auto px-5" id="why-us">
            <div data-reveal className={`${REVEAL_BASE} ${REVEAL_SHOWN} mb-10 text-center max-w-2xl mx-auto`}>
              <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--mw-primary)' }}>
                <span className="w-[22px] h-0.5" style={{ background: 'var(--mw-primary)' }} /> Our Commitment
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                {t?.sections?.trustTitle || `Why Shop with ${displayStoreName}`}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {dynamicTrustPerks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} data-reveal style={{ transitionDelay: `${i * 80}ms`, background: 'var(--mw-surface)', borderColor: 'var(--mw-border)' }} className={`${REVEAL_BASE} ${REVEAL_SHOWN} p-6 rounded-2xl border flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow`}>
                    <div>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'color-mix(in srgb, var(--mw-primary) 14%, transparent)', color: 'var(--mw-primary)' }}>
                        <Icon size={24} />
                      </div>
                      <h4 className="text-base font-extrabold mb-2">{item.title}</h4>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--mw-text-muted)' }}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Section 8: Contact ── */}
        {hasContactInfo && (
          <section className="py-12 md:py-16 border-t" style={{ background: 'var(--mw-surface)', borderColor: 'var(--mw-border)' }} id="store-connect">
            <div className="max-w-[1240px] mx-auto px-5">
              <div className="rounded-[2.5rem] p-8 md:p-12 border bg-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" style={{ borderColor: 'var(--mw-border)' }}>
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Official Store Support
                  </span>
                  <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight">Have Questions? We Are Ready to Help</h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
                    Reach out to our customer care team for direct order assistance, product availability, wholesale requests, or delivery tracking.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {ecomData.phone && (
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                        <Phone size={18} style={{ color: 'var(--mw-primary)' }} />
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Phone Hotline</span>
                          <a href={`tel:${ecomData.phone}`} className="text-sm font-black hover:underline">{ecomData.phone}</a>
                        </div>
                      </div>
                    )}
                    {ecomData.email && (
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                        <Mail size={18} style={{ color: 'var(--mw-primary)' }} />
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Support Email</span>
                          <a href={`mailto:${ecomData.email}`} className="text-sm font-black hover:underline">{ecomData.email}</a>
                        </div>
                      </div>
                    )}
                    {ecomData.address && (
                      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 sm:col-span-2">
                        <MapPin size={18} style={{ color: 'var(--mw-primary)' }} className="mt-0.5" />
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Address</span>
                          <span className="text-sm font-bold">{ecomData.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {Object.keys(contactLinks).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {contactLinks.facebook && <a href={contactLinks.facebook} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-100 transition-colors">Facebook</a>}
                      {contactLinks.instagram && <a href={contactLinks.instagram} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-100 transition-colors">Instagram</a>}
                      {contactLinks.whatsapp && <a href={contactLinks.whatsapp} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-100 transition-colors">WhatsApp</a>}
                      {contactLinks.twitter && <a href={contactLinks.twitter} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-100 transition-colors">Twitter / X</a>}
                      {contactLinks.tiktok && <a href={contactLinks.tiktok} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-100 transition-colors">TikTok</a>}
                      {contactLinks.linkedin && <a href={contactLinks.linkedin} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-white hover:bg-gray-100 transition-colors">LinkedIn</a>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Section 9: Footer ── */}
        {showFooter && (
          <footer
            style={{
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--mw-bg) 100%, white 0%), color-mix(in srgb, var(--mw-surface) 90%, var(--mw-text) 10%))',
              color: activePrimary || 'var(--mw-text)',
              borderColor: 'var(--mw-border)',
            }}
            className="pt-16 border-t"
          >
            <div className="max-w-[1240px] mx-auto px-5">
              <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1.1fr] gap-10 pb-12 border-b" style={{ borderColor: 'var(--mw-border)' }}>
                <div>
                  <div className="flex items-center gap-3 text-xl font-black uppercase mb-4">
                    {displayLogo && <img src={displayLogo} alt={displayStoreName} className="h-10 object-contain rounded-lg" />}
                    <span>{displayStoreName}</span>
                  </div>
                  <p className="text-sm leading-relaxed max-w-[320px]" style={{ color: 'var(--mw-text-muted)' }}>
                    {footerData.bio || t?.sections?.qualityProductsFooter || 'Quality products, nationwide fast delivery, and a shopping experience built around you.'}
                  </p>
                </div>

                {showCategories && categories.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-extrabold tracking-[0.14em] uppercase mb-4">{t?.sections?.categoriesLabel || 'Categories'}</h5>
                    <ul className="space-y-2.5">
                      {categories.slice(0, 6).map((category) => (
                        <li key={category._id}>
                          <Link href={`/categories?id=${category._id}`} className="text-sm hover:underline transition-colors" style={{ color: 'var(--mw-text-muted)' }}>
                            {getLocalized ? getLocalized(category) : category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h5 className="text-[11px] font-extrabold tracking-[0.14em] uppercase mb-4">{t?.sections?.supportLabel || 'Navigation'}</h5>
                  <ul className="space-y-2.5">
                    <li><Link href="/categories" className="text-sm hover:underline transition-colors" style={{ color: 'var(--mw-text-muted)' }}>{t?.nav?.categories || 'All Categories'}</Link></li>
                    <li><Link href="/product" className="text-sm hover:underline transition-colors" style={{ color: 'var(--mw-text-muted)' }}>{t?.sections?.allProducts || 'All Products'}</Link></li>
                    {brands.length > 0 && <li><Link href="#brands" className="text-sm hover:underline transition-colors" style={{ color: 'var(--mw-text-muted)' }}>Brand Partners</Link></li>}
                    <li><Link href="#why-us" className="text-sm hover:underline transition-colors" style={{ color: 'var(--mw-text-muted)' }}>{t?.nav?.whyUs || 'Why Choose Us'}</Link></li>
                    <li><Link href="/order-tracking" className="text-sm hover:underline transition-colors" style={{ color: 'var(--mw-text-muted)' }}>{t?.nav?.trackOrder || 'Track Order'}</Link></li>
                  </ul>
                </div>

                {hasContactInfo && (
                  <div>
                    <h5 className="text-[11px] font-extrabold tracking-[0.14em] uppercase mb-4">{t?.sections?.contact || 'Contact Info'}</h5>
                    <ul className="space-y-2.5 text-sm" style={{ color: 'var(--mw-text-muted)' }}>
                      {ecomData.name && <li className="font-bold" style={{ color: 'var(--mw-text)' }}>{ecomData.name}</li>}
                      {ecomData.phone && <li><a href={`tel:${ecomData.phone}`} className="hover:underline">{ecomData.phone}</a></li>}
                      {ecomData.email && <li><a href={`mailto:${ecomData.email}`} className="hover:underline">{ecomData.email}</a></li>}
                      {ecomData.address && <li className="text-xs">{ecomData.address}</li>}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 py-6 text-xs" style={{ color: 'var(--mw-text-muted)' }}>
                <span>© {new Date().getFullYear()} {displayStoreName}. {footerData.copyright || t?.sections?.allRightsReserved || 'All rights reserved.'}</span>
                <span>{t?.sections?.madeWithCare || 'Verified E-Commerce Store'}</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
