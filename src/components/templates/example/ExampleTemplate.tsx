'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  Search, Heart, ShoppingBag, Phone, MapPin, 
  ChevronDown, Star, Loader2, Menu,
  Facebook, Twitter, Instagram, Youtube
} from 'lucide-react';
import { useGet } from '@/hooks/useGet';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';
import { ApiResponse, Banner, Category, Product } from '@/types/api';

interface ExampleTemplateProps {
  searchQuery?: string;
  excludeKeys?: string[];
  className?: string;
}

interface Brand {
  _id: string;
  name: string;
  logo?: string;
}

function sectionEnabled(sections: any[] | undefined, key: string, fallback = true) {
  if (!Array.isArray(sections) || sections.length === 0) return fallback;
  const found = sections.find((s) => s?.key === key);
  return found ? found.enabled !== false : fallback;
}

export default function ExampleTemplate({
  searchQuery = '',
  excludeKeys = [],
  className = '',
}: ExampleTemplateProps) {
  const { colors, sections, storeName, logoUrl, fontStyle, contactInfo } = useStoreSettings() as any;

  // ── 1. Dynamic Backend API Hooks ───────────────────────────────────────
  const { data: bannersData, isLoading: bannersLoading } = useGet<ApiResponse<Banner>>(['banners'], '/banner');
  const { data: categoriesData, isLoading: categoriesLoading } = useGet<ApiResponse<Category>>(['categories'], '/category');
  const { data: productsData, isLoading: productsLoading } = useGet<ApiResponse<Product>>(['products'], '/product');
  const { data: brandsData } = useGet<ApiResponse<Brand>>(['brands'], '/brand');

  const [currentSearch, setCurrentSearch] = useState(searchQuery);
  const [catMenuOpen, setCatMenuOpen] = useState(true);

  const showHero = sectionEnabled(sections, 'hero');
  const showProducts = sectionEnabled(sections, 'products');
  const showBrands = sectionEnabled(sections, 'brands');
  const showFooter = sectionEnabled(sections, 'footer') && !excludeKeys.includes('footer');

  // Dynamic Theme Styling Variable Map
  const themeVars = {
    ['--bs-primary' as any]: colors?.primary || '#d9232d',
    ['--bs-secondary' as any]: colors?.secondary || '#1e293b',
    ['--bs-bg' as any]: colors?.background || '#f8fafc',
    ['--bs-text' as any]: colors?.textPrimary || '#0f172a',
    ['--bs-text-muted' as any]: colors?.textSecondary || '#64748b',
    ['--bs-font' as any]: fontStyle ? `'${fontStyle}', sans-serif` : 'sans-serif',
  } as React.CSSProperties;

  // Extract Dynamic Lists
  const categories = useMemo(() => categoriesData?.data?.data || [], [categoriesData]);
  const banners = useMemo(() => bannersData?.data?.data || [], [bannersData]);
  const products = useMemo(() => productsData?.data?.data || [], [productsData]);
  const brands = useMemo(() => brandsData?.data?.data || [], [brandsData]);

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

  const newArrivals = useMemo(() => filteredProducts.slice(0, 4), [filteredProducts]);
  const trendingProducts = useMemo(() => filteredProducts.slice(4, 8), [filteredProducts]);
  const offerProducts = useMemo(() => filteredProducts.filter(p => p.discount || p.final_price).slice(0, 4), [filteredProducts]);

  const heroMainBanner = banners[0];
  const heroTitle = heroMainBanner?.title || heroMainBanner?.name?.[0] || 'Simple and easy';
  const heroDescription = heroMainBanner?.description || 'Discover top picks dynamically synced with your store backend.';

  const isLoading = bannersLoading || categoriesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--bs-primary)]" style={{ color: colors?.primary || '#d9232d' }} />
      </div>
    );
  }

  return (
    <div className={`bs-tpl w-full bg-[#f4f5f7] min-h-screen text-slate-800 ${className}`} style={themeVars}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        .bs-tpl { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* ── Top Utility Bar ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 text-xs text-gray-600 py-2 hidden lg:block">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400" />
              {contactInfo?.address || '56 King Street, New York'}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={14} className="text-gray-400" />
              {contactInfo?.phone || '+1 964 123 456789'}
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/orders" className="hover:text-[var(--bs-primary)] transition-colors">Order Tracking</Link>
            <Link href="/register" className="hover:text-[var(--bs-primary)] transition-colors">+ Register</Link>
            <Link href="/login" className="hover:text-[var(--bs-primary)] transition-colors">Sign in</Link>
          </div>
        </div>
      </div>

      {/* ── Main Header (Logo, Search, Icons) ─────────────────────────── */}
      <header className="bg-white py-4 border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 text-3xl font-extrabold tracking-tight shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName || 'Logo'} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-slate-900">{storeName || 'bShop'}</span>
            )}
          </Link>

          <div className="flex-1 max-w-[650px] mx-4">
            <div className="flex items-center border-2 border-[var(--bs-primary)] rounded-md overflow-hidden bg-white">
              <input
                type="text"
                placeholder="Search for Products..."
                value={currentSearch}
                onChange={(e) => setCurrentSearch(e.target.value)}
                className="w-full px-4 py-2.5 text-sm outline-none text-slate-800 placeholder:text-gray-400"
              />
              <button 
                type="button"
                className="bg-[var(--bs-primary)] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:brightness-110 transition-all shrink-0"
              >
                <Search size={15} /> SEARCH
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <Link href="/wishlist" className="relative p-2 text-gray-700 hover:text-[var(--bs-primary)] transition-colors">
              <Heart size={24} />
              <span className="absolute -top-1 -right-1 bg-gray-200 text-slate-800 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                0
              </span>
            </Link>
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-[var(--bs-primary)] transition-colors">
              <ShoppingBag size={24} />
              <span className="absolute -top-1 -right-1 bg-[var(--bs-primary)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Navigation Bar ────────────────────────────────────────────── */}
      <nav className="bg-[#2a323d] text-white">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setCatMenuOpen(!catMenuOpen)}
              className="bg-[var(--bs-primary)] text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 flex items-center gap-3 hover:brightness-110 transition-all w-[240px] justify-between"
            >
              <span className="flex items-center gap-2">
                <Menu size={16} /> TOP CATEGORIES
              </span>
              <ChevronDown size={14} className={`transition-transform ${catMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
              <Link href="/" className="hover:text-[var(--bs-primary)] transition-colors">Home</Link>
              <Link href="/categories" className="hover:text-[var(--bs-primary)] transition-colors">Mega Menu</Link>
              <Link href="/products" className="hover:text-[var(--bs-primary)] transition-colors">Mega Fixed Width</Link>
              <Link href="/offers" className="hover:text-[var(--bs-primary)] transition-colors">Dropdown</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section (Top Categories + Main Hero) ──────────────────── */}
      {showHero && (
        <section className="max-w-[1400px] mx-auto px-6 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            
            {/* Dynamic Left Categories */}
            <div className={`bg-white border border-gray-200 divide-y divide-gray-100 ${catMenuOpen ? 'block' : 'hidden lg:block'}`}>
              {categories.slice(0, 10).map((cat) => (
                <Link
                  key={cat._id}
                  href={`/categories?id=${cat._id}`}
                  className="block px-5 py-3 text-xs font-medium text-slate-700 hover:text-[var(--bs-primary)] hover:bg-gray-50 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Dynamic Main Hero Banner */}
            <div className="relative rounded-lg overflow-hidden bg-white min-h-[380px] flex items-center border border-gray-200">
              {heroMainBanner ? (
                <div className="w-full h-full relative grid grid-cols-1 md:grid-cols-2 items-center p-8 bg-gradient-to-r from-red-600 to-rose-500 text-white">
                  <div className="space-y-4 z-10">
                    <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
                      Online Shop
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                      {heroTitle}
                    </h1>
                    <p className="text-xs text-white/90 max-w-md leading-relaxed">
                      {heroDescription}
                    </p>
                    <Link
                      href="/products"
                      className="inline-block bg-white text-slate-900 font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-md shadow-md hover:bg-slate-100 transition-colors"
                    >
                      SHOP NOW
                    </Link>
                  </div>
                  <div className="relative flex justify-center items-center mt-6 md:mt-0">
                    <img
                      src={heroMainBanner.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'}
                      alt="Hero Product"
                      className="max-h-[300px] object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center w-full">
                  <h2 className="text-2xl font-bold">Welcome to {storeName || 'our Store'}</h2>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Dynamic 5-Grid Feature Banners Section (Matching Screenshot) ─ */}
      <FeatureBannersGrid banners={banners.slice(1)} primaryColor={colors?.primary || '#d9232d'} />

      {/* ── Shop by Brands ────────────────────────────────────────────── */}
      {showBrands && brands.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 pt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Shop by Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <div key={brand._id} className="bg-white border border-gray-200 rounded-md p-4 flex items-center justify-center hover:shadow-md transition-shadow h-24">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="max-h-12 max-w-full object-contain" />
                ) : (
                  <span className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">{brand.name}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── New Arrivals ──────────────────────────────────────────────── */}
      {showProducts && newArrivals.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">New Arrivals</h2>
            <Link href="/products" className="bg-[var(--bs-primary)] text-white text-xs font-bold uppercase px-4 py-2 rounded hover:brightness-110">
              SEE ALL
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod._id} product={prod} badge="NEW" />
            ))}
          </div>
        </section>
      )}

      {/* ── Trending Products ─────────────────────────────────────────── */}
      {showProducts && trendingProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Trending Products</h2>
            <Link href="/products" className="bg-[var(--bs-primary)] text-white text-xs font-bold uppercase px-4 py-2 rounded hover:brightness-110">
              SEE ALL
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* ── Available Offer ───────────────────────────────────────────── */}
      {showProducts && offerProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Available Offer</h2>
            <Link href="/products" className="bg-[var(--bs-primary)] text-white text-xs font-bold uppercase px-4 py-2 rounded hover:brightness-110">
              SEE ALL
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offerProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} badge="OFF" />
            ))}
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      {showFooter && (
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8 text-xs text-slate-600 mt-16">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-200">
            
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-4">Contact Us</h4>
              <p className="mb-2"><strong>Address:</strong> {contactInfo?.address || '56 King Street, New York'}</p>
              <p className="mb-2"><strong>Email:</strong> {contactInfo?.email || 'support@bshop.com'}</p>
              <p className="mb-4"><strong>Phone:</strong> {contactInfo?.phone || '+1 964 123 456789'}</p>
              <div className="flex gap-3 text-slate-700">
                <Facebook size={16} /> <Twitter size={16} /> <Instagram size={16} /> <Youtube size={16} />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-4">Quick links</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-[var(--bs-primary)]">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[var(--bs-primary)]">Terms and Conditions</Link></li>
                <li><Link href="/purchasing" className="hover:text-[var(--bs-primary)]">Purchasing Policy</Link></li>
                <li><Link href="/cookie" className="hover:text-[var(--bs-primary)]">Cookie Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-[var(--bs-primary)]">About us</Link></li>
                <li><Link href="/career" className="hover:text-[var(--bs-primary)]">Career</Link></li>
                <li><Link href="/affiliate" className="hover:text-[var(--bs-primary)]">Affiliate</Link></li>
                <li><Link href="/contact" className="hover:text-[var(--bs-primary)]">Contact us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-4">Subscribe our newsletter</h4>
              <p className="mb-4 text-gray-500">Subscribe to the mailing list to receive updates on special offers and new arrivals.</p>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-[var(--bs-primary)]"
                />
                <button type="submit" className="w-full bg-[var(--bs-primary)] text-white font-bold text-xs uppercase py-2.5 rounded">
                  SUBMIT
                </button>
              </form>
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto px-6 pt-6 text-xs text-gray-500">
            <p>Copyright © {new Date().getFullYear()}. All rights reserved by <span className="text-[var(--bs-primary)] font-bold">{storeName || 'bShop'}</span></p>
          </div>
        </footer>
      )}
    </div>
  );
}

// ── 2. Feature Banners Grid Sub-Component (Matching Banner Image Grid) ───
function FeatureBannersGrid({ banners = [], primaryColor = '#d9232d' }: { banners: Banner[]; primaryColor?: string }) {
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
              <h3 className="text-2xl font-black text-slate-900 leading-none">{pickBannerTitle(b1, 'New')}</h3>
              <p className="text-sm font-bold text-slate-900 mb-3">{pickBannerSubtitle(b1, 'Collection')}</p>
              <Link href="/products" style={btnStyle} className="inline-block text-white text-[10px] font-extrabold uppercase px-4 py-2 rounded shadow hover:brightness-110 transition-all">
                SHOP NOW
              </Link>
            </div>
            <img src={b1?.images?.[0] || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400'} alt="Banner 1" className="w-36 h-36 object-contain drop-shadow-md" />
          </div>

          <div className="bg-[#ff7ba9] rounded-sm p-6 flex items-center justify-between min-h-[195px] relative overflow-hidden shadow-sm">
            <div className="z-10 space-y-1.5 max-w-[55%]">
              <h3 className="text-2xl font-black text-slate-900 leading-none">{pickBannerTitle(b2, 'Hot')}</h3>
              <p className="text-sm font-bold text-slate-900 mb-3">{pickBannerSubtitle(b2, 'Collection')}</p>
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
              <h3 className="text-2xl font-black text-slate-900 leading-none">{pickBannerTitle(b4, 'New')}</h3>
              <p className="text-sm font-bold text-slate-900 mb-3">{pickBannerSubtitle(b4, 'Arrivals')}</p>
              <Link href="/products" style={btnStyle} className="inline-block text-white text-[10px] font-extrabold uppercase px-4 py-2 rounded shadow hover:brightness-110 transition-all">
                SHOP NOW
              </Link>
            </div>
            <img src={b4?.images?.[0] || 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&q=80&w=400'} alt="Banner 4" className="w-36 h-36 object-contain drop-shadow-md" />
          </div>

          <div className="bg-[#c48ceb] rounded-sm p-6 flex items-center justify-between min-h-[195px] relative overflow-hidden shadow-sm">
            <div className="z-10 space-y-1.5 max-w-[55%]">
              <h3 className="text-2xl font-black text-slate-900 leading-none">{pickBannerTitle(b5, 'Hot')}</h3>
              <p className="text-sm font-bold text-slate-900 mb-3">{pickBannerSubtitle(b5, 'Offer')}</p>
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

// ── 3. Product Card Sub-Component ───────────────────────────────────────
function ProductCard({ product, badge }: { product: Product; badge?: string }) {
  const price = product.final_price ?? product.main_price ?? product.price ?? 0;
  const oldPrice = product.main_price && product.final_price ? product.main_price : null;

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow relative group">
      {badge && (
        <span className="absolute top-3 left-3 bg-[#1e293b] text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded z-10">
          {badge}
        </span>
      )}

      <Link href={`/product/${product._id}`} className="block relative pt-[100%] overflow-hidden bg-white p-4">
        <img
          src={product.image || product.gallery_product?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600'}
          alt={product.name}
          className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-4 flex flex-col flex-1 justify-between border-t border-gray-50">
        <div>
          <h3 className="font-bold text-xs text-slate-800 line-clamp-1 mb-1 group-hover:text-[var(--bs-primary)] transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-gray-500 mb-0.5">
            Brand: <span className="text-[var(--bs-primary)]">{product.brand?.name || (product as any).brand_name || 'Roadstar'}</span>
          </p>
          <p className="text-[11px] text-gray-500 mb-3">
            Sold By: <span className="text-[var(--bs-primary)]">{(product as any).seller || 'Store'}</span>
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-sm text-slate-900">${Number(price).toLocaleString()}</span>
            {oldPrice && (
              <span className="text-xs text-[var(--bs-primary)] line-through font-medium">
                ${Number(oldPrice).toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className={i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
            ))}
            <span className="text-[10px] text-gray-500 ml-1">(1)</span>
          </div>
        </div>
      </div>
    </div>
  );
}