"use client";
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages?: number; // Optional if API doesn't provide it
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    hasNextPage?: boolean; // Alternative if totalPages isn't known
}

export default function Pagination({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    isLoading = false,
    hasNextPage = true
}: PaginationProps) {
    const isFirstPage = currentPage === 1;
    const isLastPage = totalPages ? currentPage >= totalPages : !hasNextPage;

    if (isFirstPage && isLastPage) return null;

    return (
        <div className="flex items-center justify-center gap-4 mt-12 mb-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={isFirstPage || isLoading}
                className={`
                    flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all
                    ${isFirstPage || isLoading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-100 text-primary hover:border-secondary hover:text-secondary shadow-sm active:scale-95'}
                `}
            >
                <ChevronLeft size={20} />
                <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest px-4">
                    Page <span className="text-primary">{currentPage}</span>
                    {totalPages && <> <span className="mx-1">of</span> {totalPages}</>}
                </span>
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={isLastPage || isLoading}
                className={`
                    flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all
                    ${isLastPage || isLoading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-secondary shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'}
                `}
            >
                <span>Next</span>
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
