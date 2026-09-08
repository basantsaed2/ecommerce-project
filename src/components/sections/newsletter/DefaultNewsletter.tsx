"use client";
import React, { useState } from 'react';
import { Mail, Send, Check } from 'lucide-react';
import { toast } from 'sonner';

interface NewsletterProps {
    title?: string;
    subtitle?: string;
    config?: Record<string, any>;
}

export default function DefaultNewsletter({
    title,
    subtitle
}: NewsletterProps) {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }
        setSubscribed(true);
        toast.success('Thank you for subscribing to our newsletter!');
        setEmail("");
    };

    return (
        <section className="w-full py-10">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/95 to-secondary/80 p-8 sm:p-12 md:p-14 text-white shadow-2xl relative overflow-hidden text-center max-w-5xl mx-auto">
                {/* Decorative background lights */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -z-0" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/30 rounded-full blur-3xl -z-0" />

                <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-secondary border border-white/20 mb-2">
                        <Mail size={28} />
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        {title || "Stay Ahead with Exclusive Deals & Updates"}
                    </h2>

                    <p className="text-gray-200 text-sm sm:text-base font-normal max-w-lg mb-4">
                        {subtitle || "Subscribe to our weekly newsletter to receive member-only discounts, new releases, and inspiration directly in your inbox."}
                    </p>

                    <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address..."
                            className="flex-1 px-5 py-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-secondary text-white hover:brightness-110 font-bold px-6 py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-secondary/30"
                        >
                            {subscribed ? (
                                <>
                                    <Check size={18} /> Subscribed
                                </>
                            ) : (
                                <>
                                    <span>Subscribe</span>
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-[11px] text-gray-300 pt-1">
                        We respect your privacy. Unsubscribe anytime with one click.
                    </p>
                </div>
            </div>
        </section>
    );
}
