"use client";

import React, { useState } from 'react';
import { X, Ruler, Sparkles } from 'lucide-react';

interface SizeGuideDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SizeGuideDialog({ isOpen, onClose }: SizeGuideDialogProps) {
    const [unit, setUnit] = useState<'cm' | 'in'>('cm');
    const [categoryTab, setCategoryTab] = useState<'tops' | 'bottoms' | 'shoes'>('tops');

    if (!isOpen) return null;

    const topsSizes = [
        { size: 'S', chestCm: '88-92', waistCm: '76-80', chestIn: '34-36', waistIn: '30-32' },
        { size: 'M', chestCm: '96-100', waistCm: '84-88', chestIn: '38-40', waistIn: '33-35' },
        { size: 'L', chestCm: '104-108', waistCm: '92-96', chestIn: '41-43', waistIn: '36-38' },
        { size: 'XL', chestCm: '112-116', waistCm: '100-104', chestIn: '44-46', waistIn: '39-41' },
        { size: 'XXL', chestCm: '120-124', waistCm: '108-112', chestIn: '47-49', waistIn: '42-44' },
    ];

    const shoeSizes = [
        { eu: '40', us: '7', uk: '6.5', cm: '25.0', in: '9.8' },
        { eu: '41', us: '8', uk: '7.5', cm: '26.0', in: '10.2' },
        { eu: '42', us: '9', uk: '8.5', cm: '26.5', in: '10.4' },
        { eu: '43', us: '10', uk: '9.5', cm: '27.5', in: '10.8' },
        { eu: '44', us: '11', uk: '10.5', cm: '28.5', in: '11.2' },
        { eu: '45', us: '12', uk: '11.5', cm: '29.5', in: '11.6' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                    <div className="flex items-center gap-2 text-primary">
                        <Ruler className="text-secondary" size={24} />
                        <h3 className="text-xl font-black">Size & Fit Guide</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs & Unit switch */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                        <button
                            onClick={() => setCategoryTab('tops')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                categoryTab === 'tops' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                            }`}
                        >
                            Shirts & Tops
                        </button>
                        <button
                            onClick={() => setCategoryTab('shoes')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                categoryTab === 'shoes' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                            }`}
                        >
                            Shoes & Footwear
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setUnit('cm')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                unit === 'cm' ? 'bg-secondary text-white' : 'text-gray-500'
                            }`}
                        >
                            CM
                        </button>
                        <button
                            onClick={() => setUnit('in')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                unit === 'in' ? 'bg-secondary text-white' : 'text-gray-500'
                            }`}
                        >
                            Inches
                        </button>
                    </div>
                </div>

                {/* Tables */}
                {categoryTab === 'tops' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-[11px]">
                                    <th className="py-3 px-4 rounded-l-xl">Size</th>
                                    <th className="py-3 px-4">Chest ({unit.toUpperCase()})</th>
                                    <th className="py-3 px-4 rounded-r-xl">Waist ({unit.toUpperCase()})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                {topsSizes.map((row) => (
                                    <tr key={row.size} className="hover:bg-gray-50/50">
                                        <td className="py-3 px-4 font-black text-primary">{row.size}</td>
                                        <td className="py-3 px-4">{unit === 'cm' ? row.chestCm : row.chestIn}</td>
                                        <td className="py-3 px-4">{unit === 'cm' ? row.waistCm : row.waistIn}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-[11px]">
                                    <th className="py-3 px-4 rounded-l-xl">EU</th>
                                    <th className="py-3 px-4">US</th>
                                    <th className="py-3 px-4">UK</th>
                                    <th className="py-3 px-4 rounded-r-xl">Foot Length ({unit.toUpperCase()})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                {shoeSizes.map((row) => (
                                    <tr key={row.eu} className="hover:bg-gray-50/50">
                                        <td className="py-3 px-4 font-black text-primary">{row.eu}</td>
                                        <td className="py-3 px-4">{row.us}</td>
                                        <td className="py-3 px-4">{row.uk}</td>
                                        <td className="py-3 px-4">{unit === 'cm' ? row.cm : row.in}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 p-4 bg-secondary/5 rounded-2xl border border-secondary/10 flex items-start gap-3 text-xs text-gray-600">
                    <Sparkles size={18} className="text-secondary shrink-0 mt-0.5" />
                    <p>
                        <strong className="text-primary">Fit Tip:</strong> If you are between two sizes, we recommend sizing up for a relaxed fit, or sizing down for a tailored silhouette.
                    </p>
                </div>
            </div>
        </div>
    );
}
