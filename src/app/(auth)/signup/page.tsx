"use client";
import Link from 'next/link';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-stretch">
            {/* الجانب الأيمن: صورة جمالية (تظهر في الشاشات الكبيرة) */}
            <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1540958483582-b7aae2ec4619?q=80&w=2000&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                    alt="Fashion"
                />
                <div className="relative z-10 p-16 flex flex-col justify-between text-white">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter mb-4">JOIN THE <br /> REVOLUTION.</h2>
                        <p className="text-xl opacity-80 max-w-md">Create an account and unlock a world of exclusive fashion and tech deals tailored just for you.</p>
                    </div>
                    <div className="flex gap-8">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                            <p className="text-2xl font-bold">10k+</p>
                            <p className="text-xs opacity-60 uppercase">Active Users</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                            <p className="text-2xl font-bold">500+</p>
                            <p className="text-xs opacity-60 uppercase">Global Brands</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* الجانب الأيسر: الفورم */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 md:p-16">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Get Started</h1>
                        <p className="text-gray-500 mt-2">Create your account in 30 seconds.</p>
                    </div>

                    <form className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                            <input type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" />
                        </div>

                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                            <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                            <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" />
                        </div>

                        <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2">
                            Create Account <ArrowRight size={20} />
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-600">
                        Already a member? <Link href="/login" className="text-secondary font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}