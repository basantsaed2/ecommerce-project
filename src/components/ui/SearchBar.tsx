"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
    className?: string;
    isLoading?: boolean;
}

export default function SearchBar({ 
    onSearch, 
    placeholder = "Search for products, categories, or brands...", 
    className = "",
    isLoading = false 
}: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Live search with debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch?.(query);
        }, 300); // 300ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [query, onSearch]);

    const handleClear = () => {
        setQuery("");
        inputRef.current?.focus();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(query);
    };

    return (
        <form 
            onSubmit={handleSubmit}
            className={`relative group w-full max-w-2xl mx-auto transition-all duration-300 ${className}`}
        >
            <div className={`
                relative flex items-center bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden
                ${isFocused 
                    ? 'border-secondary shadow-[0_10px_30px_rgba(var(--secondary-rgb),0.1)] ring-4 ring-secondary/5' 
                    : 'border-gray-100 hover:border-gray-200 shadow-sm'}
            `}>
                <div className={`pl-5 pr-3 text-gray-400 transition-colors duration-300 ${isFocused ? 'text-secondary' : ''}`}>
                    {isLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <Search size={20} />
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="w-full py-4 bg-transparent border-none outline-none text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal"
                />

                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-2 mr-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
            
            {/* Ambient Background Effect */}
            <div className={`
                absolute -inset-1 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-[22px] -z-10 blur-xl transition-opacity duration-500
                ${isFocused ? 'opacity-100' : 'opacity-0'}
            `} />
        </form>
    );
}
