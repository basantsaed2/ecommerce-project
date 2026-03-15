"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Option {
    _id: string;
    name: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
}

export default function SearchableSelect({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select option", 
    label,
    error,
    disabled = false
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt._id === value);

    const filteredOptions = options.filter(opt => 
        opt.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchQuery("");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleSelect = (optId: string) => {
        onChange(optId);
        setIsOpen(false);
    };

    return (
        <div className="space-y-1.5 relative" ref={containerRef}>
            {label && (
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            
            <div 
                onClick={handleToggle}
                className={cn(
                    "w-full px-4 py-3 bg-gray-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all",
                    isOpen ? "bg-white ring-4 ring-secondary/10 border-secondary" : "border-gray-100 hover:border-gray-200",
                    error ? "border-red-500" : "",
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                )}
            >
                <span className={cn(
                    "font-bold text-sm",
                    !selectedOption ? "text-gray-400" : "text-primary"
                )}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown size={16} className={cn(
                    "text-gray-400 transition-transform duration-300",
                    isOpen ? "rotate-180" : ""
                )} />
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-gray-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg outline-none text-sm font-medium"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt._id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(opt._id);
                                    }}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                                        value === opt._id ? "bg-secondary/5 text-secondary" : "hover:bg-gray-50 text-gray-600"
                                    )}
                                >
                                    <span className="font-bold text-sm">{opt.name}</span>
                                    {value === opt._id && <Check size={16} />}
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-400">
                                <p className="text-sm font-bold">No results found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 text-[10px] font-bold ml-1">{error}</p>}
        </div>
    );
}
