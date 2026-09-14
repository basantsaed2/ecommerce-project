'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  Search, Heart, ShoppingBag, Phone, Mail, MapPin, 
  ChevronDown, Star, ArrowRight, Loader2, Menu,
  Facebook, Twitter, Instagram, Youtube
} from 'lucide-react';
import { useGet } from '@/hooks/useGet';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';
import { ApiResponse, Banner, Category, Product } from '@/types/api';

interface BShopTemplateProps {
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
}: BShopTemplateProps) {
  const { colors, sections, storeName, logoUrl, fontStyle, contactInfo } = useStoreSettings() as any;

  // ── Dynamic Backend API Hooks ──────────────────────────────────────────
  const { data: bannersData, isLoading: bannersLoading } = useGet<ApiResponse<Banner>>(['banners'], '/banner');
  const { data: categoriesData, isLoading: categoriesLoading } = useGet<ApiResponse<Category>>(['categories'], '/category');
  const { data: productsData, isLoading: productsLoading } = useGet<ApiResponse<Product>>(['products'], '/product');
  const { data: brandsData } = useGet<ApiResponse<Brand>>(['brands'], '/brand');

  const [currentSearch, setCurrentSearch] = useState(searchQuery);
  const [catMenuOpen, setCatMenuOpen] = useState(true);

  const showHero = sectionEnabled(sections, 'hero');
  const showCategories = sectionEnabled(sections, 'categories');
  const showProducts = sectionEnabled(sections, 'products');
  const showBrands = sectionEnabled(sections, 'brands');
  const showFooter = sectionEnabled(sections, 'footer') && !excludeKeys.includes('footer');

  // Dynamic colors & CSS Theme Setup
  const themeVars = {
    ['--bs-primary' as any]: colors?.primary || '#d9232d',
    ['--bs-secondary' as any]: colors?.secondary || '#1e293b',
    ['--bs-bg' as any]: colors?.background || '#f8fafc',
    ['--bs-text' as any]: colors?.textPrimary || '#0f172a',
    ['--bs-text-muted' as any]: colors?.textSecondary || '#64748b',
    ['--bs-font' as any]: fontStyle ? `'${fontStyle}', sans-serif` : 'sans-serif',
  } as React.CSSProperties;

  // Dynamic Data Extraction
  const categories = useMemo(() => categoriesData?.data?.data || [], [categoriesData]);
  const banners = useMemo(() => bannersData?.data?.data || [], [bannersData]);
  const products = useMemo(() => productsData?.data?.data || [], [productsData]);
  const brands = useMemo(() => brandsData?.data?.data || [], [brandsData]);

  // Filtered lists based on search
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
  const subBanners = banners.slice(1, 4);

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

      {/* ── 1. Top Contact & Utility Bar ──────────────────────────────── */}
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

      {/* ── 2. Main Header (Logo + Search + Icons) ────────────────────── */}
      <header className="bg-white py-4 border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-3xl font-extrabold tracking-tight shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName || 'Logo'} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-slate-900">{storeName || 'bShop'}</span>
            )}
          </Link>

          {/* Search Bar */}
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
                <Search size={15} /> Search
              </button>
            </div>
          </div>

          {/* Header Action Badges */}
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

      {/* ── 3. Navigation Bar & Categories Toggle ───────────────────────── */}
      <nav className="bg-[#2a323d] text-white">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Top Categories Dropdown Header */}
            <button
              onClick={() => setCatMenuOpen(!catMenuOpen)}
              className="bg-[var(--bs-primary)] text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 flex items-center gap-3 hover:brightness-110 transition-all w-[240px] justify-between"
            >
              <span className="flex items-center gap-2">
                <Menu size={16} /> TOP CATEGORIES
              </span>
              <ChevronDown size={14} className={`transition-transform ${catMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Horizontal Links */}
            <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
              <Link href="/" className="hover:text-[var(--bs-primary)] transition-colors">Home</Link>
              <Link href="/categories" className="hover:text-[var(--bs-primary)] transition-colors">Mega Menu</Link>
              <Link href="/products" className="hover:text-[var(--bs-primary)] transition-colors">Mega Fixed Width</Link>
              <Link href="/offers" className="hover:text-[var(--bs-primary)] transition-colors">Dropdown</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── 4. Hero Section with Sidebar Categories ──────────────────────── */}
      {showHero && (
        <section className="max-w-[1400px] mx-auto px-6 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            
            {/* Left Dynamic Categories Sidebar */}
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

            {/* Right Dynamic Main Hero Banner */}
            <div className="relative rounded-lg overflow-hidden bg-white min-h-[380px] flex items-center border border-gray-200">
              {heroMainBanner ? (
                <div className="w-full h-full relative grid grid-cols-1 md:grid-cols-2 items-center p-8 bg-gradient-to-r from-red-600 to-rose-500 text-white">
                  <div className="space-y-4 z-10">
                    <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
                      Online Shop
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                      {heroMainBanner.name?.[0] || 'SIMPLE AND EASY'}
                    </h1>
                    <p className="text-xs text-white/90 max-w-md leading-relaxed">
                      {heroMainBanner.description || 'Discover quality products picked for you, with fast delivery and secure checkout every time.'}
                    </p>
                    <Link
                      href="/product"
                      className="inline-block bg-white text-slate-900 font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-md shadow-md hover:bg-slate-100 transition-colors"
                    >
                      SHOP NOW
                    </Link>
                  </div>
                  <div className="relative flex justify-center items-center mt-6 md:mt-0">
                    <img
                      src={heroMainBanner.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'}
                      alt="Banner Image"
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

          {/* Sub-banners (3 Columns Grid) */}
          {subBanners.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {subBanners.map((banner, idx) => (
                <div key={banner._id || idx} className="bg-sky-400 text-white rounded-lg p-6 flex items-center justify-between overflow-hidden shadow-sm relative">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider">New</span>
                    <h3 className="text-lg font-extrabold uppercase mb-3">{banner.name?.[0] || 'Collection'}</h3>
                    <Link href="/product" className="bg-[var(--bs-primary)] text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded">
                      SHOP NOW
                    </Link>
                  </div>
                  <img
                    src={banner.images?.[0] || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400'}
                    alt="Sub Banner"
                    className="w-28 h-28 object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 5. Shop by Brands ───────────────────────────────────────────── */}
      {showBrands && brands.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 pt-12">
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

      {/* ── 6. New Arrivals (Product Grid matching screenshot) ────────── */}
      {showProducts && newArrivals.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">New Arrivals</h2>
            <Link href="/product" className="bg-[var(--bs-primary)] text-white text-xs font-bold uppercase px-4 py-2 rounded hover:brightness-110">
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

      {/* ── 7. Trending Products ───────────────────────────────────────── */}
      {showProducts && trendingProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Trending Products</h2>
            <Link href="/product" className="bg-[var(--bs-primary)] text-white text-xs font-bold uppercase px-4 py-2 rounded hover:brightness-110">
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

      {/* ── 8. Available Offer ─────────────────────────────────────────── */}
      {showProducts && offerProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Available Offer</h2>
            <Link href="/product" className="bg-[var(--bs-primary)] text-white text-xs font-bold uppercase px-4 py-2 rounded hover:brightness-110">
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

      {/* ── 9. Wide Promotion Banner ──────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 my-16">
        <div className="bg-gray-100 rounded-lg p-10 flex flex-col md:flex-row items-center justify-between border border-gray-200">
          <div className="max-w-md">
            <h2 className="text-3xl font-black uppercase text-slate-900 mb-2">TRENDING</h2>
            <p className="text-xs text-gray-500 mb-6">Consectetur adipisicing elit. Dolores nisi distinctio magni</p>
            <Link href="/product" className="bg-[var(--bs-primary)] text-white text-xs font-bold uppercase px-6 py-3 rounded">
              SHOP NOW
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <img
              src={banners[1]?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'}
              alt="Promo"
              className="max-h-60 object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── 10. Dynamic Footer ────────────────────────────────────────── */}
      {showFooter && (
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8 text-xs text-slate-600">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-200">
            
            {/* Contact Us */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-4">Contact Us</h4>
              <p className="mb-2"><strong>Address:</strong> {contactInfo?.address || '56 King Street, New York'}</p>
              <p className="mb-2"><strong>Email:</strong> {contactInfo?.email || 'support@bshop.com'}</p>
              <p className="mb-4"><strong>Phone:</strong> {contactInfo?.phone || '+1 964 123 456789'}</p>
              <div className="flex gap-3 text-slate-700">
                <Facebook size={16} /> <Twitter size={16} /> <Instagram size={16} /> <Youtube size={16} />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-4">Quick links</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-[var(--bs-primary)]">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[var(--bs-primary)]">Terms and Conditions</Link></li>
                <li><Link href="/purchasing" className="hover:text-[var(--bs-primary)]">Purchasing Policy</Link></li>
                <li><Link href="/cookie" className="hover:text-[var(--bs-primary)]">Cookie Policy</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-[var(--bs-primary)]">About us</Link></li>
                <li><Link href="/career" className="hover:text-[var(--bs-primary)]">Career</Link></li>
                <li><Link href="/affiliate" className="hover:text-[var(--bs-primary)]">Affiliate</Link></li>
                <li><Link href="/contact" className="hover:text-[var(--bs-primary)]">Contact us</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
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

          <div className="max-w-[1400px] mx-auto px-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>Copyright © {new Date().getFullYear()}. All rights reserved by <span className="text-[var(--bs-primary)] font-bold">{storeName || 'bShop'}</span></p>
          </div>
        </footer>
      )}
    </div>
  );
}

// ── Shared Product Card Component (Matches Screenshots Exactly) ───────────
function ProductCard({ product, badge }: { product: Product; badge?: string }) {
  const price = product.final_price ?? product.main_price ?? product.price ?? 0;
  const oldPrice = product.main_price && product.final_price ? product.main_price : null;

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow relative group">
      {/* Badge Top Left */}
      {badge && (
        <span className="absolute top-3 left-3 bg-[#1e293b] text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded z-10">
          {badge}
        </span>
      )}

      {/* Product Image */}
      <Link href={`/product/${product._id}`} className="block relative pt-[100%] overflow-hidden bg-white p-4">
        <img
          src={product.image || product.gallery_product?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600'}
          alt={product.name}
          className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Details Section */}
      <div className="p-4 flex flex-col flex-1 justify-between border-t border-gray-50">
        <div>
          <h3 className="font-bold text-xs text-slate-800 line-clamp-1 mb-1 group-hover:text-[var(--bs-primary)] transition-colors">
            {product.name}
          </h3>
          
          {/* Brand & Seller */}
          <p className="text-[11px] text-gray-500 mb-0.5">
            Brand: <span className="text-[var(--bs-primary)]">{product.brand?.name || (product as any).brand_name || 'Roadstar'}</span>
          </p>
          <p className="text-[11px] text-gray-500 mb-3">
            Sold By: <span className="text-[var(--bs-primary)]">{(product as any).seller || 'Store'}</span>
          </p>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-sm text-slate-900">${Number(price).toLocaleString()}</span>
            {oldPrice && (
              <span className="text-xs text-[var(--bs-primary)] line-through font-medium">
                ${Number(oldPrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* Star Rating */}
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