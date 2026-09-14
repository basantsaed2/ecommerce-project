'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, ShieldCheck, Sparkles, Star, Truck, Undo2 } from 'lucide-react';
import { useGet } from '@/hooks/useGet';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';
import DynamicSectionRenderer from '@/components/sections/DynamicSectionRenderer';
import { ApiResponse, Banner, Category, Product } from '@/types/api';

interface MarwanTemplateProps {
  searchQuery?: string;
  excludeKeys?: string[];
  className?: string;
}

const WHY_US = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Nationwide shipping with real-time order tracking to your door.' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: 'Every transaction is encrypted and protected end to end.' },
  { icon: Undo2, title: 'Easy Returns', desc: 'Changed your mind? Return within 14 days, no questions asked.' },
  { icon: Sparkles, title: 'Curated Quality', desc: 'Every product is checked for quality before it reaches you.' },
];

/* Shared Tailwind fragments for the "reveal on scroll" effect. We toggle the
   opacity/translate classes directly (no custom .mw-rev/.mw-in CSS needed). */
const REVEAL_HIDDEN = 'opacity-0 translate-y-7';
const REVEAL_SHOWN = 'opacity-100 translate-y-0';
const REVEAL_BASE = 'transition-all duration-700 ease-out';

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────── */
function sectionEnabled(sections: any[] | undefined, key: string, fallback = true) {
  if (!Array.isArray(sections) || sections.length === 0) return fallback;
  const found = sections.find((s) => s?.key === key);
  return found ? found.enabled !== false : fallback;
}

function googleFontParam(fontStyle?: string) {
  const family = (fontStyle || 'Poppins').trim() || 'Poppins';
  return family.replace(/\s+/g, '+');
}

export default function MarwanTemplate({
  searchQuery = '',
  excludeKeys = [],
  className = '',
}: MarwanTemplateProps) {
  const { colors, sections, storeName, logoUrl, fontStyle, settings } = useStoreSettings() as any;

  const { data: bannersData, isLoading: bannersLoading } = useGet<ApiResponse<Banner>>(['banners'], '/banner');
  const { data: categoriesData, isLoading: categoriesLoading } = useGet<ApiResponse<Category>>(['categories'], '/category');
  const { data: productsData, isLoading: productsLoading } = useGet<ApiResponse<Product>>(['products'], '/product');

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [searchText, setSearchText] = useState(searchQuery || '');

  useEffect(() => {
    setSearchText(searchQuery || '');
  }, [searchQuery]);

  const activeSearch = searchText.trim().toLowerCase();

  const showHero = sectionEnabled(sections, 'hero');
  const showFeatures = sectionEnabled(sections, 'features');
  const showCategories = sectionEnabled(sections, 'categories');
  const showProducts = sectionEnabled(sections, 'products');
  const showFooter = sectionEnabled(sections, '') && !excludeKeys.includes('');
  const extraSections = useMemo(() => {
    const keysToSkip = new Set(['hero', 'features', 'categories', 'products', 'footer']);
    return ((sections || []) as any[])
      .filter((section: any) => section && section.enabled !== false && !keysToSkip.has(section.key))
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  }, [sections]);
  /* ── Theme, fully driven by the backend response ────────────────────────
     These become plain CSS custom properties on the wrapper, so any
     Tailwind arbitrary-value class (e.g. bg-[var(--mw-primary)]) can read
     them without hardcoding a single hex value anywhere below. ────────── */
  const themeVars = {
    ['--mw-primary' as any]: colors?.primary || '#e6a817',
    ['--mw-secondary' as any]: colors?.secondary || '#111827',
    ['--mw-bg' as any]: colors?.background || '#ffffff',
    ['--mw-text' as any]: colors?.textPrimary || '#111827',
    ['--mw-text-muted' as any]: colors?.textSecondary || '#6b7280',
    ['--mw-font' as any]: fontStyle ? `'${fontStyle}', sans-serif` : 'inherit',
    ['--mw-surface' as any]: 'color-mix(in srgb, var(--mw-bg) 96%, var(--mw-text) 4%)',
    ['--mw-surface-2' as any]: 'color-mix(in srgb, var(--mw-bg) 92%, var(--mw-text) 8%)',
    ['--mw-border' as any]: 'color-mix(in srgb, var(--mw-text) 12%, transparent)',
  } as React.CSSProperties;

  const fontQuery = useMemo(() => googleFontParam(fontStyle), [fontStyle]);

  /* ── Fixed header + scroll-spy ─────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const ids = ['categories', 'products', 'why-us'];
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
  }, [showCategories, showProducts, showFeatures]);

  /* ── Scroll-reveal, driven by [data-reveal] + swapping Tailwind classes ─ */
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
  }, [bannersLoading, categoriesLoading, productsLoading]);

  /* ── Data shaping ────────────────────────────────────────────────────── */
  const heroBanner = useMemo(() => {
    const list = bannersData?.data?.data || [];
    return list.find((b) => b.name?.some((n) => /home|hero|main/i.test(String(n)))) || list[0];
  }, [bannersData]);

  const heroImages = heroBanner?.images?.length
    ? heroBanner.images
    : ['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1600'];

  const categories = useMemo(() => {
    const list = categoriesData?.data?.data || [];
    const q = activeSearch;
    const filtered = q
      ? list.filter((c) => c.name?.toLowerCase().includes(q) || c.ar_name?.toLowerCase().includes(q))
      : list;
    return filtered.slice(0, 6);
  }, [categoriesData, activeSearch]);

  const products = useMemo(() => {
    const list = productsData?.data?.data || [];
    const q = activeSearch;
    const filtered = q
      ? list.filter((p) => p.name?.toLowerCase().includes(q) || p.ar_name?.toLowerCase().includes(q))
      : list;
    return filtered.slice(0, 8);
  }, [productsData, activeSearch]);

  useEffect(() => {
    if (!activeSearch) return;

    if (showCategories && categories.length > 0) {
      document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (showProducts && products.length > 0) {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSearch, showCategories, showProducts, categories.length, products.length]);

  const priceText = (product: Product) => {
    const raw = product.final_price ?? product.main_price ?? product.price ?? 0;
    return `EGP ${Number(raw).toLocaleString()}`;
  };

  const contactUser = settings?.ecommerceUsers?.[0] || {};
  const contactLinks = contactUser.social_links || {};
  const hasContactInfo = Boolean(contactUser.name || contactUser.email || contactUser.phone || Object.keys(contactLinks).length);

  const isLoading = bannersLoading || categoriesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: colors?.primary || '#e6a817' }} />
      </div>
    );
  }

  /* Reusable Tailwind fragments (kept as variables so the JSX below stays readable) */
  const navItems = [
    { key: 'categories', label: 'Categories', enabled: showCategories, href: '#categories' },
    { key: 'products', label: 'Products', enabled: showProducts, href: '#products' },
    { key: 'why-us', label: 'Why Us', enabled: showFeatures, href: '#why-us' },
  ].filter((item) => item.enabled);

  const navLinkCls = (active: boolean) =>
    `text-[13px] font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors ${
      active ? 'border-[var(--mw-primary)] text-[var(--mw-text)]' : 'border-transparent text-[var(--mw-text-muted)] hover:text-[var(--mw-text)]'
    }`;

  const topActionStyle = {
    background: 'transparent',
    color: 'var(--mw-text)',
    border: '1px solid var(--mw-border)',
  } as React.CSSProperties;

  return (
    <div className={`mw-tpl w-full max-w-full overflow-x-hidden m-0 p-0 ${className}`} style={themeVars}>
      {/* Only what Tailwind genuinely cannot express: the google-font import
          and three custom keyframes (marquee scroll, hero glow, floating logo). */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${fontQuery}:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes mwScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes mwGlow { from { opacity: .5; transform: scale(1); } to { opacity: 1; transform: scale(1.12); } }
        @keyframes mwFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
      `}</style>

      <div style={{ fontFamily: 'var(--mw-font)', background: 'var(--mw-bg)', color: 'var(--mw-text)' }} className="w-full pt-[72px]">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <header
          className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg backdrop-blur-md' : ''}`}
          style={{
            background: 'color-mix(in srgb, var(--mw-secondary) 96%, black 4%)',
            borderBottom: '1px solid color-mix(in srgb, var(--mw-primary) 65%, transparent)',
          }}
        >
          <div className="max-w-[1460px] mx-auto px-4 flex items-center justify-between h-[72px] gap-4">
            <Link href="/" className="text-[28px] md:text-[36px] font-black uppercase tracking-tight leading-none shrink-0" style={{ color: 'var(--mw-primary)' }}>
              {storeName || 'STORE'}
            </Link>

            <div className="hidden md:flex flex-1 justify-center px-3">
              <div className="flex w-full max-w-[500px] items-center gap-3 rounded-full border px-4 py-2.5" style={{ background: 'color-mix(in srgb, var(--mw-bg) 18%, transparent)', borderColor: 'color-mix(in srgb, var(--mw-primary) 35%, transparent)' }}>
                <span style={{ color: 'var(--mw-text-muted)' }}>⌕</span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search for products, categories, or brands..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--mw-text-muted)]"
                  style={{ color: 'var(--mw-text)' }}
                />
              </div>
            </div>

            <nav className="hidden md:flex items-center justify-center gap-8 shrink-0">
              {navItems.map((item) => (
                <Link key={item.key} href={item.href} className={navLinkCls(activeSection === item.key)}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/product"
                className="hidden md:inline-flex items-center justify-center px-6 py-3 rounded-full text-[13px] font-extrabold uppercase tracking-wider transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--mw-primary)', color: 'var(--mw-secondary)' }}
              >
                Test Ride →
              </Link>
            </div>

            <button
              className="md:hidden text-2xl leading-none"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
              style={{ color: 'var(--mw-text)' }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden max-w-[1240px] mx-auto px-5 pb-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 rounded-full border px-3 py-2" style={{ background: 'var(--mw-bg)', borderColor: 'var(--mw-border)' }}>
                <span style={{ color: 'var(--mw-text-muted)' }}>⌕</span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--mw-text-muted)]"
                  style={{ color: 'var(--mw-text)' }}
                />
              </div>
              {showCategories && <Link href="#categories" onClick={() => setMenuOpen(false)}>Categories</Link>}
              {showProducts && <Link href="#products" onClick={() => setMenuOpen(false)}>Products</Link>}
              {showFeatures && <Link href="#why-us" onClick={() => setMenuOpen(false)}>Why Us</Link>}
            </div>
          )}
        </header>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        {showHero && (
          <section className="relative min-h-[86vh] flex items-center overflow-hidden" style={{ background: 'var(--mw-secondary)' }}>
            <div className="absolute inset-0 z-0">
              <img
                src={heroImages[0]}
                alt={heroBanner?.name?.[0] || storeName || 'Hero banner'}
                className="w-full h-full object-cover brightness-[.42] saturate-[1.05]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(100deg, color-mix(in srgb, var(--mw-secondary) 85%, black) 10%, color-mix(in srgb, var(--mw-secondary) 30%, transparent) 55%, transparent 100%)',
                }}
              />
            </div>
            <div
              className="absolute top-[8%] left-[4%] w-[620px] h-[620px] z-[1] pointer-events-none rounded-full [animation:mwGlow_4s_ease-in-out_infinite_alternate]"
              style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--mw-primary) 22%, transparent) 0%, transparent 70%)' }}
            />

            <div className="relative z-[2] w-full max-w-[1240px] mx-auto px-5">
              <div className={`grid gap-6 items-center ${logoUrl ? 'md:grid-cols-[1.05fr_1fr]' : 'grid-cols-1'}`}>
                <div data-reveal className={`${REVEAL_BASE} ${REVEAL_SHOWN}`}>
                  <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] uppercase mb-5" style={{ color: 'var(--mw-primary)' }}>
                    <span className="w-6 h-0.5" style={{ background: 'var(--mw-primary)' }} />
                    Welcome to {storeName || 'our store'}
                  </div>

                  <h1 className="text-[2.6rem] md:text-[4rem] lg:text-[5.2rem] font-black leading-[.95] uppercase tracking-tight text-white mb-5">
                    Shop the{' '}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: 'linear-gradient(90deg, color-mix(in srgb, var(--mw-primary) 70%, white), var(--mw-primary))' }}
                    >
                      latest
                    </span>
                    <br /> arrivals today
                  </h1>

                  <p className="max-w-[480px] text-base leading-[1.8] text-white/80 mb-8">
                    {heroBanner?.description || 'Discover quality products picked for you, with fast delivery and secure checkout every time.'}
                  </p>

                  <div className="flex flex-wrap gap-4 mb-10">
                    {showProducts && (
                      <Link
                        href="#products"
                        className="inline-flex items-center gap-2 px-6 py-4 rounded-full font-extrabold text-[13px] uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5"
                        style={{ background: 'var(--mw-primary)', boxShadow: '0 16px 36px color-mix(in srgb, var(--mw-primary) 40%, transparent)' }}
                      >
                        Shop Now <ArrowRight size={17} />
                      </Link>
                    )}
                    {showCategories && (
                      <Link
                        href="#categories"
                        className="inline-flex items-center gap-2 px-6 py-4 rounded-full font-extrabold text-[13px] uppercase tracking-wider text-white bg-white/5 border border-white/30 transition-transform hover:-translate-y-0.5 hover:border-white"
                      >
                        Browse Categories
                      </Link>
                    )}
                  </div>

                  <div className="flex gap-9 pt-6 border-t border-white/15">
                    <div>
                      <b className="block text-3xl font-black" style={{ color: 'var(--mw-primary)' }}>{categories.length || '—'}</b>
                      <span className="block mt-1 text-[11px] font-semibold tracking-wider uppercase text-white/65">Categories</span>
                    </div>
                    <div>
                      <b className="block text-3xl font-black" style={{ color: 'var(--mw-primary)' }}>{products.length || '—'}</b>
                      <span className="block mt-1 text-[11px] font-semibold tracking-wider uppercase text-white/65">Products</span>
                    </div>
                    <div>
                      <b className="block text-3xl font-black" style={{ color: 'var(--mw-primary)' }}>24/7</b>
                      <span className="block mt-1 text-[11px] font-semibold tracking-wider uppercase text-white/65">Support</span>
                    </div>
                  </div>
                </div>

                {logoUrl && (
                  <div
                    data-reveal
                    className={`${REVEAL_BASE} ${REVEAL_SHOWN} flex items-center justify-end order-first md:order-last`}
                    style={{ transitionDelay: '120ms' }}
                    aria-hidden="true"
                  >
                    <img
                      src={logoUrl}
                      alt={storeName || 'Logo'}
                      className="w-[55%] md:w-[92%] max-w-[400px] h-auto object-contain [animation:mwFloat_5s_ease-in-out_infinite]"
                      style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,.5))' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Stats bar ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ background: 'var(--mw-primary)' }}>
          {[
            { v: categories.length, l: 'Categories' },
            { v: products.length, l: 'Products' },
            { v: '14d', l: 'Free Returns' },
            { v: '24/7', l: 'Support' },
          ].map((s, i) => (
            <div key={s.l} className={`text-center py-7 px-4 border-white/20 hover:bg-white/10 transition-colors ${i < 3 ? 'border-r' : ''}`}>
              <b className="block text-3xl font-black text-white">{s.v}</b>
              <small className="block mt-1 text-[11px] font-bold tracking-wider uppercase text-white/85">{s.l}</small>
            </div>
          ))}
        </div>

        {extraSections.length > 0 && (
          <div className="w-full">
            <DynamicSectionRenderer
              sections={extraSections}
              searchQuery={searchQuery}
              excludeKeys={[]}
              className="w-full"
            />
          </div>
        )}

        {/* ── Categories ───────────────────────────────────────────────── */}
        {showCategories && categories.length > 0 && (
          <section className="py-8 md:py-10" id="categories">
            <div className=" mx-auto px-0">
              <div data-reveal className={`${REVEAL_BASE} ${REVEAL_SHOWN} flex flex-wrap items-end justify-between gap-4 mb-8`}>
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--mw-primary)' }}>
                    <span className="w-[22px] h-0.5" style={{ background: 'var(--mw-primary)' }} /> Curated collections
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                    Shop by <span style={{ color: 'var(--mw-primary)' }}>category</span>
                  </h2>
                </div>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border text-[11px] font-extrabold uppercase tracking-wider transition-colors"
                  style={{ borderColor: 'var(--mw-border)' }}
                >
                  View all <ArrowRight size={15} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {categories.map((category, i) => (
                  <Link
                    key={category._id}
                    href={`/categories?id=${category._id}`}
                    data-reveal
                    style={{ transitionDelay: `${(i % 3) * 80}ms` }}
                    className={`${REVEAL_BASE} ${REVEAL_SHOWN} group relative rounded-xl overflow-hidden border hover:-translate-y-1 transition-transform`}
                  >
                    <div className="relative h-[210px] overflow-hidden">
                      <img
                        src={category.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    </div>
                    <div className="absolute left-0 right-0 bottom-0 p-5 text-white">
                      <h3 className="text-lg font-extrabold uppercase mb-1">{category.name}</h3>
                      <span className="text-xs text-white/75">{category.product_quantity ?? 0} items</span>
                    </div>
                    <div
                      className="absolute left-0 bottom-0 h-[3px] w-full scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300"
                      style={{ background: 'var(--mw-primary)' }}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Products ─────────────────────────────────────────────────── */}
        {showProducts && products.length > 0 && (
          <section className="py-8 md:py-10" id="products">
            <div className=" mx-auto px-0">
              <div data-reveal className={`${REVEAL_BASE} ${REVEAL_SHOWN} flex flex-wrap items-end justify-between gap-4 mb-8`}>
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--mw-primary)' }}>
                    <span className="w-[22px] h-0.5" style={{ background: 'var(--mw-primary)' }} /> Best picks
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                    Featured <span style={{ color: 'var(--mw-primary)' }}>products</span>
                  </h2>
                </div>
                <Link
                  href="/product"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border text-[11px] font-extrabold uppercase tracking-wider"
                  style={{ borderColor: 'var(--mw-border)' }}
                >
                  See more <ArrowRight size={15} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {products.map((product, i) => (
                  <div
                    key={product._id}
                    data-reveal
                    style={{ transitionDelay: `${(i % 3) * 80}ms`, background: 'var(--mw-surface)', borderColor: 'var(--mw-border)' }}
                    className={`${REVEAL_BASE} ${REVEAL_SHOWN} group rounded-xl overflow-hidden border hover:-translate-y-1 transition-[transform,box-shadow]`}
                  >
                    <div className="relative h-[220px] overflow-hidden" style={{ background: 'var(--mw-surface-2)' }}>
                      <span
                        className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white"
                        style={{ background: 'var(--mw-primary)' }}
                      >
                        New
                      </span>
                      <img
                        src={product.image || product.gallery_product?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-black" style={{ color: 'var(--mw-primary)' }}>{priceText(product)}</span>
                      </div>
                      <h3 className="text-base font-extrabold mb-2">{product.name}</h3>
                      <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--mw-text-muted)' }}>
                        {product.description || 'Quality build, everyday comfort, and a design made to last.'}
                      </p>
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/product/${product._id}`}
                          className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider transition-all group-hover:gap-2.5"
                        >
                          View Details <ArrowRight size={14} />
                        </Link>
                        <Star size={16} style={{ color: 'var(--mw-primary)' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Why us ───────────────────────────────────────────────────── */}
        {showFeatures && (
          <section className="py-8 md:py-10" id="why-us" style={{ background: 'var(--mw-surface)' }}>
            <div className=" mx-auto px-0">
              <div data-reveal className={`${REVEAL_BASE} ${REVEAL_SHOWN} mb-8`}>
                <div className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--mw-primary)' }}>
                  <span className="w-[22px] h-0.5" style={{ background: 'var(--mw-primary)' }} /> Why choose us
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                  Built around <span style={{ color: 'var(--mw-primary)' }}>trust</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {WHY_US.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      data-reveal
                      style={{ transitionDelay: `${i * 80}ms`, background: 'var(--mw-bg)', borderColor: 'var(--mw-border)' }}
                      className={`${REVEAL_BASE} ${REVEAL_SHOWN} p-6 rounded-2xl border`}
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: 'color-mix(in srgb, var(--mw-primary) 14%, transparent)', color: 'var(--mw-primary)' }}
                      >
                        <Icon size={22} />
                      </div>
                      <h4 className="text-base font-extrabold mb-2">{item.title}</h4>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--mw-text-muted)' }}>{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Footer ───────────────────────────────────────────────────── */}
        {showFooter && (
          <footer
            style={{
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--mw-bg) 100%, white 0%), color-mix(in srgb, var(--mw-surface) 90%, var(--mw-text) 10%))',
              color: colors?.textPrimary || 'var(--mw-text)',
              borderColor: 'var(--mw-border)',
            }}
            className="pt-16 border-t"
          >
            <div className="max-w-[1240px] mx-auto px-5">
              <div className="rounded-[28px] border px-5 py-5 md:px-8 md:py-7 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4" style={{ background: 'var(--mw-secondary)', borderColor: 'color-mix(in srgb, var(--mw-primary) 40%, transparent)', boxShadow: '0 18px 45px color-mix(in srgb, var(--mw-primary) 18%, transparent)' }}>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] mb-2" style={{ color: 'var(--mw-primary)' }}>Stay in the loop</p>
                  <h3 className="text-2xl md:text-3xl font-black text-white">Get exclusive deals & fresh arrivals</h3>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/5 border px-2 py-2 md:min-w-[360px]" style={{ borderColor: 'color-mix(in srgb, var(--mw-primary) 35%, transparent)' }}>
                  <span className="px-3 text-sm" style={{ color: 'var(--mw-text-muted)' }}>⌕</span>
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search products or categories"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
                    style={{ color: 'white' }}
                  />
                  <button className="rounded-full px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-white" style={{ background: 'var(--mw-primary)' }}>
                    Join
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1.1fr] gap-10 pb-12 border-b" style={{ borderColor: 'var(--mw-border)' }}>
                <div>
                  <div className="flex items-center gap-2 text-xl font-black uppercase mb-4">
                    {logoUrl && <img src={logoUrl} alt={storeName || 'Store logo'} className="w-9 h-9 object-contain rounded-lg" />}
                    <span>{storeName || 'STORE'}</span>
                  </div>
                  <p className="text-sm leading-relaxed max-w-[320px]" style={{ color: 'var(--mw-text-muted)' }}>
                    Quality products, fast delivery, and a shopping experience built around you.
                  </p>
                </div>

                {showCategories && categories.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-extrabold tracking-[0.14em] uppercase mb-4">Categories</h5>
                    <ul className="space-y-2.5">
                      {categories.slice(0, 5).map((category) => (
                        <li key={category._id}>
                          <Link href={`/categories?id=${category._id}`} className="text-sm hover:underline transition-colors" style={{ color: 'var(--mw-text-muted)' }}>
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h5 className="text-[11px] font-extrabold tracking-[0.14em] uppercase mb-4">Support</h5>
                  <ul className="space-y-2.5">
                    <li><Link href="/product" className="text-sm hover:underline transition-colors" style={{ color: 'var(--mw-text-muted)' }}>All Products</Link></li>
                    <li><Link href="#why-us" className="text-sm hover:underline transition-colors" style={{ color: 'var(--mw-text-muted)' }}>Shipping &amp; Returns</Link></li>
                    <li><Link href="#" className="text-sm hover:underline transition-colors" style={{ color: 'var(--mw-text-muted)' }}>Contact Us</Link></li>
                  </ul>
                </div>

                {hasContactInfo && (
                  <div>
                    <h5 className="text-[11px] font-extrabold tracking-[0.14em] uppercase mb-4">Contact</h5>
                    <ul className="space-y-2.5 text-sm" style={{ color: 'var(--mw-text-muted)' }}>
                      {contactUser.name && <li className="font-semibold" style={{ color: 'var(--mw-text)' }}>{contactUser.name}</li>}
                      {contactUser.email && (
                        <li>
                          <a href={`mailto:${contactUser.email}`} className="hover:underline">{contactUser.email}</a>
                        </li>
                      )}
                      {contactUser.phone && (
                        <li>
                          <a href={`tel:${contactUser.phone}`} className="hover:underline">{contactUser.phone}</a>
                        </li>
                      )}
                    </ul>

                    {Object.keys(contactLinks).length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {contactLinks.facebook && (
                          <a href={contactLinks.facebook} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: 'var(--mw-border)', color: 'var(--mw-text-muted)' }}>FB</a>
                        )}
                        {contactLinks.instagram && (
                          <a href={contactLinks.instagram} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: 'var(--mw-border)', color: 'var(--mw-text-muted)' }}>IG</a>
                        )}
                        {contactLinks.whatsapp && (
                          <a href={contactLinks.whatsapp} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: 'var(--mw-border)', color: 'var(--mw-text-muted)' }}>WA</a>
                        )}
                        {contactLinks.twitter && (
                          <a href={contactLinks.twitter} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: 'var(--mw-border)', color: 'var(--mw-text-muted)' }}>X</a>
                        )}
                        {contactLinks.tiktok && (
                          <a href={contactLinks.tiktok} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: 'var(--mw-border)', color: 'var(--mw-text-muted)' }}>TikTok</a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 py-6 text-xs" style={{ color: 'var(--mw-text-muted)' }}>
                <span>© {new Date().getFullYear()} {storeName || 'Store'}. All rights reserved.</span>
                <span>Made with care.</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}