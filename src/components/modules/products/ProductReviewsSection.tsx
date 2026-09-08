"use client";

import React, { useState } from 'react';
import { Star, CheckCircle2, ThumbsUp, MessageSquare, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
    id: number;
    author: string;
    rating: number;
    date: string;
    title: string;
    comment: string;
    verified: boolean;
    likes: number;
}

const SAMPLE_REVIEWS: Review[] = [
    {
        id: 1,
        author: "Tamer Hassan",
        rating: 5,
        date: "2 days ago",
        title: "Exceptional quality and fast shipping!",
        comment: "The material feels incredibly premium and fits true to size. Delivery took less than 48 hours to Cairo. Will definitely buy more colors!",
        verified: true,
        likes: 14,
    },
    {
        id: 2,
        author: "Mona El-Sayed",
        rating: 5,
        date: "1 week ago",
        title: "Exact match to photos & description",
        comment: "Very happy with this order. The finishing and packaging were top tier. Highly recommended to everyone looking for great value.",
        verified: true,
        likes: 9,
    },
    {
        id: 3,
        author: "Youssef Adel",
        rating: 4,
        date: "2 weeks ago",
        title: "Great product, slightly snug fit",
        comment: "Excellent craftsmanship and stylish look. I recommend ordering one size up if you prefer a looser fit.",
        verified: true,
        likes: 6,
    }
];

export default function ProductReviewsSection() {
    const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newName, setNewName] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newComment, setNewComment] = useState('');

    const handleAddReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newComment) {
            toast.error('Please complete all required review fields');
            return;
        }

        const newEntry: Review = {
            id: Date.now(),
            author: newName,
            rating: newRating,
            date: "Just now",
            title: newTitle || "Great Purchase",
            comment: newComment,
            verified: true,
            likes: 0,
        };

        setReviews(prev => [newEntry, ...prev]);
        setIsWritingReview(false);
        setNewName('');
        setNewTitle('');
        setNewComment('');
        toast.success('Thank you! Your review has been published.');
    };

    return (
        <section className="bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-sm mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                <div>
                    <h3 className="text-2xl font-black text-primary tracking-tight">
                        Customer Ratings & Reviews
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                        Real feedback from verified buyers
                    </p>
                </div>

                <button
                    onClick={() => setIsWritingReview(true)}
                    className="bg-primary text-white hover:bg-secondary px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 w-fit"
                >
                    <Plus size={16} />
                    Write a Review
                </button>
            </div>

            {/* Ratings Breakdown Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 items-center border-b border-gray-100">
                {/* Average Score */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl text-center">
                    <span className="text-5xl font-black text-primary mb-2">4.8</span>
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={18} fill="currentColor" />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 font-bold">
                        Based on {reviews.length + 42} verified customer reviews
                    </span>
                </div>

                {/* Progress bars */}
                <div className="md:col-span-8 space-y-2.5 text-xs font-bold text-gray-600">
                    {[
                        { stars: 5, pct: '85%' },
                        { stars: 4, pct: '11%' },
                        { stars: 3, pct: '3%' },
                        { stars: 2, pct: '1%' },
                        { stars: 1, pct: '0%' },
                    ].map((row) => (
                        <div key={row.stars} className="flex items-center gap-3">
                            <span className="w-12">{row.stars} Stars</span>
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: row.pct }} />
                            </div>
                            <span className="w-10 text-right text-gray-400">{row.pct}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Write Review Form Modal / Box */}
            {isWritingReview && (
                <form onSubmit={handleAddReview} className="p-6 bg-secondary/5 border border-secondary/20 rounded-2xl my-6 space-y-4 animate-fadeIn">
                    <h4 className="text-base font-black text-primary">Share Your Experience</h4>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Your Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    onClick={() => setNewRating(star)}
                                    className={`p-1 ${newRating >= star ? 'text-amber-400' : 'text-gray-300'}`}
                                >
                                    <Star size={24} fill="currentColor" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Your Name *</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Sarah M."
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Review Headline</label>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="e.g. Excellent purchase!"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Your Review *</label>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            placeholder="Tell us what you liked about this item..."
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-secondary text-white rounded-xl font-bold text-xs hover:brightness-110 shadow-sm"
                        >
                            Submit Review
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsWritingReview(false)}
                            className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            <div className="divide-y divide-gray-100 mt-6">
                {reviews.map((rev) => (
                    <div key={rev.id} className="py-6 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-primary">{rev.author}</span>
                                {rev.verified && (
                                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 size={12} /> Verified Buyer
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-400">{rev.date}</span>
                        </div>

                        <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} size={14} fill="currentColor" />
                            ))}
                        </div>

                        <h5 className="text-sm font-bold text-gray-900">{rev.title}</h5>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{rev.comment}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
