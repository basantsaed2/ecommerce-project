"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home, Grid, Heart, ShoppingCart, User,
    Menu, X, Briefcase, LogIn, LogOut
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // 1. قراءة البيانات من Redux
    // 1. قراءة البيانات من Redux بشكل منفصل لتقليل الـ Renders
    const token = useSelector((state: RootState) => state.auth.token);
    const user = useSelector((state: RootState) => state.auth.user);
    const cartCount = useSelector((state: RootState) => state.cart.items.length);

    // التأكد من تحميل المكون على الكلاينت لحل مشكلة الـ Hydration و null data
    useEffect(() => {
        setMounted(true);
    }, []);

    const isLoggedIn = !!token;

    const navLinks = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Category', href: '/categories', icon: Grid },
        { name: 'Brands', href: '/brands', icon: Briefcase },
    ];

    const handleLogout = () => {
        dispatch(logout());
        setSidebarOpen(false);
        router.push('/login');
    };

    const authRoutes = ["/login", "/signup"];
    if (authRoutes.includes(pathname)) return null;

    // منع الرندر غير المتوافق مع السيرفر حتى يكتمل التحميل
    if (!mounted) return <nav className="h-20 bg-white border-b border-gray-100" />;

    return (
        <>
            {/* --- 1. Top Navbar (Desktop) --- */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 h-20 flex items-center justify-between">
                <Link href="/" className="text-2xl font-black tracking-tighter text-primary">
                    STORE<span className="text-secondary">.</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-8 text-sm font-semibold">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${pathname === link.href ? 'text-secondary' : 'text-gray-500'} hover:text-secondary transition relative group`}
                        >
                            {link.name}
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-secondary transition-all ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {/* Icons (Desktop/Tablet) */}
                    {isLoggedIn && (
                        <div className="flex items-center gap-1 bg-gray-50 rounded-2xl p-1">
                            <Link href="/favourite" className="p-2 text-gray-500 hover:text-red-500 transition-colors hidden md:block">
                                <Heart size={20} />
                            </Link>
                            <Link href="/cart" className="relative p-2 bg-white rounded-xl shadow-sm text-primary transition-all hover:scale-105">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    )}

                    {/* Auth Buttons (Desktop) */}
                    <div className="hidden md:flex items-center gap-3 ml-2">
                        {!isLoggedIn ? (
                            <>
                                <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-primary hover:bg-gray-50 rounded-xl transition">Login</Link>
                                <Link href="/signup" className="px-5 py-2.5 text-sm font-bold bg-primary text-white rounded-xl hover:shadow-lg transition">Sign Up</Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/profile" className="flex items-center gap-2 group">
                                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary font-bold border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                                        {user?.name?.charAt(0).toUpperCase() || <User size={18} />}
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 hidden lg:block uppercase tracking-tight">
                                        {user?.name}
                                    </span>
                                </Link>
                                <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    <button className="lg:hidden p-2 text-gray-900 bg-gray-50 rounded-lg" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                </div>
            </nav>

            {/* --- 2. Mobile Bottom Navigation (PWA Style) --- */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-4 py-3 z-50 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <Link href="/" className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-secondary' : 'text-gray-400'}`}>
                    <Home size={22} />
                    <span className="text-[10px] font-bold">Home</span>
                </Link>
                <Link href="/categories" className={`flex flex-col items-center gap-1 ${pathname === '/categories' ? 'text-secondary' : 'text-gray-400'}`}>
                    <Grid size={22} />
                    <span className="text-[10px] font-bold">Menu</span>
                </Link>
                <Link href="/cart" className={`relative flex flex-col items-center gap-1 ${pathname === '/cart' ? 'text-secondary' : 'text-gray-400'}`}>
                    <ShoppingCart size={22} />
                    <span className="text-[10px] font-bold">Cart</span>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 right-0 bg-secondary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                            {cartCount}
                        </span>
                    )}
                </Link>
                <Link href="/favourite" className={`flex flex-col items-center gap-1 ${pathname === '/favourite' ? 'text-secondary' : 'text-gray-400'}`}>
                    <Heart size={22} />
                    <span className="text-[10px] font-bold">Wishlist</span>
                </Link>
                <Link href={isLoggedIn ? "/profile" : "/login"} className={`flex flex-col items-center gap-1 ${pathname === '/profile' || pathname === '/login' ? 'text-secondary' : 'text-gray-400'}`}>
                    <User size={22} />
                    <span className="text-[10px] font-bold">{isLoggedIn ? "Profile" : "Account"}</span>
                </Link>
            </div>

            {/* --- 3. Sidebar (Mobile/Tablet) --- */}
            <aside className={`fixed top-0 left-0 h-full w-72 bg-white z-[60] shadow-2xl transform transition-transform duration-500 lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-10">
                        <span className="font-black text-2xl tracking-tighter text-primary">MENU<span className="text-secondary">.</span></span>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 bg-gray-50 rounded-full"><X size={20} /></button>
                    </div>

                    <div className="flex flex-col gap-6">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)} className="flex items-center gap-4 text-lg font-bold text-gray-700 hover:text-secondary transition group">
                                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-secondary/10 transition-colors">
                                    <link.icon size={20} className="text-gray-400 group-hover:text-secondary" />
                                </div>
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto pt-10 border-t border-gray-100">
                        {!isLoggedIn ? (
                            <div className="flex flex-col gap-3">
                                <Link href="/login" onClick={() => setSidebarOpen(false)} className="w-full py-4 text-center font-bold border border-gray-200 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                                    <LogIn size={18} /> Login
                                </Link>
                                <Link href="/signup" onClick={() => setSidebarOpen(false)} className="w-full py-4 text-center font-bold bg-primary text-white rounded-2xl">Create Account</Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-md">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-black text-sm text-gray-900 truncate uppercase">{user?.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2">
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {isSidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden" onClick={() => setSidebarOpen(false)} />}
        </>
    );
}