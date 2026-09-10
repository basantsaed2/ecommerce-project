'use client';

import DynamicSectionRenderer from '@/components/sections/DynamicSectionRenderer';
import { useStoreSettings } from '@/components/providers/StoreThemeProvider';

interface ExampleTemplateProps {
    searchQuery?: string;
    excludeKeys?: string[];
    className?: string;
}

const categoryCards = [
    {
        name: 'أسرّات مراتب',
        image:
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    },
    {
        name: 'وسائد',
        image:
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    },
    {
        name: 'مراتب ستاندرد',
        image:
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    },
    {
        name: 'مراتب مميزة',
        image:
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    },
    {
        name: 'جمعيات',
        image:
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    },
];

export default function ExampleTemplate({
    searchQuery = '',
    excludeKeys = ['footer'],
    className = '',
}: ExampleTemplateProps) {
    const { sections } = useStoreSettings();

    return (
        <div className={`w-full ${className}`}>
            <div className="mb-6 overflow-hidden rounded-none border-b border-slate-200 bg-[#f5f5f2]">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-[#2c3d4d] px-6 py-3 text-white">
                    <div className="flex items-center gap-3 text-sm text-slate-200">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/60 text-[10px]">◌</span>
                        <span>العربية</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-200">
                        <span>مرحبًا بكم في متجرنا</span>
                        <span>تواصل معنا</span>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm ring-1 ring-slate-200">
                            🛒
                        </button>
                        <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm ring-1 ring-slate-200">
                            👤
                        </button>
                    </div>

                    <div className="flex flex-1 items-center justify-center gap-3">
                        <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-200">
                            <span className="text-slate-400">⌕</span>
                            <span className="text-sm text-slate-500">ابحث عن المنتجات</span>
                        </div>
                    </div>

                    <div className="text-3xl font-black tracking-tight text-slate-800">ENGLANDER</div>
                </div>

                <div className="flex items-center justify-center gap-6 border-t border-slate-200 bg-[#e8e8e4] px-6 py-3 text-sm font-medium text-slate-700">
                    <span className="cursor-pointer">الرئيسية</span>
                    <span className="cursor-pointer">مراتب</span>
                    <span className="cursor-pointer">مستلزمات النوم</span>
                    <span className="cursor-pointer">وسائد</span>
                    <span className="cursor-pointer">تخفيضات</span>
                </div>
            </div>

            <div
                className="relative mb-8 h-[520px] overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage:
                        "linear-gradient(90deg, rgba(17,24,39,0.18), rgba(17,24,39,0.3)), url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80')",
                }}
            >
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 flex h-full items-center justify-end px-6 md:px-16">
                    <div className="max-w-xl text-right text-white">
                        <h1 className="text-5xl font-black leading-tight md:text-6xl">مراتب</h1>
                        <p className="mt-4 text-base text-white/90 md:text-lg">
                            جودة مميزة، دعم متواصل، وراحة لا تضاهى في كل ليلة.
                        </p>
                        <div className="mt-7 flex justify-end gap-3">
                            <button className="rounded-xl bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1e293b]">
                                Shop Now
                            </button>
                            <button className="rounded-xl border border-white/70 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                                اكتشف أكثر
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-5">
                {categoryCards.map((item, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                        <div
                            className="h-52 w-full overflow-hidden rounded-full border-4 border-white bg-cover bg-center shadow-md"
                            style={{ backgroundImage: `url('${item.image}')` }}
                        />
                        <p className="mt-4 text-lg font-medium text-slate-700">{item.name}</p>
                    </div>
                ))}
            </div>

            <div className="mb-8 rounded-[30px] bg-[#cfe8f5] px-8 py-6 text-right">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="text-3xl font-black text-slate-800 md:text-4xl">تسوق حسب الفئة</div>
                    <div className="text-xl font-medium text-slate-700">خصومات تصل إلى 50%</div>
                </div>
            </div>

            <div className="mb-12 rounded-[28px] bg-[#f3f4f6] p-6 text-right shadow-sm ring-1 ring-slate-200">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-800">اكتشف منتجاتنا</h2>
                    <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                        جميع المنتجات
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200">
                            <div
                                className="h-72 bg-cover bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80')",
                                }}
                            />
                            <div className="p-5">
                                <div className="mb-3 text-sm text-slate-500">مراتب / أسرة</div>
                                <h3 className="text-2xl font-bold text-slate-800">مراتب مميزة</h3>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xl font-black text-slate-900">LE 8,900.00</span>
                                    <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                                        أضف للسلة
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <DynamicSectionRenderer
                sections={sections}
                searchQuery={searchQuery}
                excludeKeys={excludeKeys}
            />
        </div>
    );
}
