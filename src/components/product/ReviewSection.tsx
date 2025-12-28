import React, { useEffect, useState } from 'react';
import { Star, ThumbsUp, CheckCircle2, BadgeCheck, Loader2, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '@/apiConfig';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/motion';
import RatingSection from './RatingSection';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/dateUtils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import api from '@/api/axios';

interface Review {
    id: string;
    user: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title?: string;
    comment: string;
    verified?: boolean;
    helpful?: number;
    images?: string[];
    adminReply?: string;
    adminReplyAt?: any;
    createdAt: string;
}

interface ReviewStats {
    avgRating: number;
    totalReviews: number;
    distribution: { [key: number]: number };
}

interface ReviewSectionProps {
    productId: string;
    productName: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId, productName }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());
    const { user } = useAuth();

    const fetchReviews = async (newReview?: any) => {
        if (newReview) {
            setReviews(prev => [newReview, ...prev]);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews || []);
                setStats(data.stats || null);
            }
        } catch (error) {
            console.error(error);
            // Fallback to embedded ratings
            try {
                const res = await fetch(`${API_BASE_URL}/products/${productId}`);
                if (res.ok) {
                    const data = await res.json();
                    const legacyReviews = (data.ratings || []).map((r: any, i: number) => ({
                        id: r._id || `legacy - ${i} `,
                        user: r.user,
                        userName: r.name,
                        rating: r.rating,
                        comment: r.review,
                        createdAt: r.date,
                        verified: false
                    }));
                    setReviews(legacyReviews);
                }
            } catch (e) { }
        } finally {
            setLoading(false);
        }
    };

    const handleHelpful = async (reviewId: string) => {
        if (!user) {
            toast.error('Please login to mark reviews as helpful');
            return;
        }
        if (helpfulClicked.has(reviewId)) {
            return;
        }

        try {
            const res = await api.post(`/ reviews / ${reviewId}/helpful`);
            if (res.status === 200) {
                const updated = res.data;
                setReviews(prev => prev.map(r =>
                    r.id === reviewId ? { ...r, helpful: updated.helpful } : r
                ));
                setHelpfulClicked(prev => new Set(prev).add(reviewId));
                toast.success('Thanks for your feedback!');
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchReviews();
        // Load helpful clicks from localStorage
        const stored = localStorage.getItem(`helpful_${productId}`);
        if (stored) {
            setHelpfulClicked(new Set(JSON.parse(stored)));
        }
    }, [productId]);

    // Save helpful clicks to localStorage
    useEffect(() => {
        if (helpfulClicked.size > 0) {
            localStorage.setItem(`helpful_${productId}`, JSON.stringify([...helpfulClicked]));
        }
    }, [helpfulClicked, productId]);

    return (
        <section className="mt-8 sm:mt-24">
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-display font-bold">Customer Reviews</h2>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                    {stats?.totalReviews || reviews.length}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
                {/* Left Column: Rating Form + Stats */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Rating Distribution */}
                    {stats && stats.totalReviews > 0 && (
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-4xl font-bold text-primary">{stats.avgRating}</span>
                                <div>
                                    <div className="flex text-yellow-500">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={cn("h-4 w-4", star <= Math.round(stats.avgRating) ? "fill-current" : "text-gray-300")} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{stats.totalReviews} reviews</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = stats.distribution[star] || 0;
                                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-2 text-sm">
                                            <span className="w-3">{star}</span>
                                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${percentage}%` }} />
                                            </div>
                                            <span className="w-8 text-muted-foreground">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <RatingSection
                        productId={productId}
                        productName={productName}
                        onRatingSubmit={fetchReviews}
                    />
                </div>

                {/* Right Column: Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 bg-muted/30 rounded-3xl border border-dashed border-border">
                            <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-muted-foreground">No reviews yet</h3>
                            <p className="text-sm text-muted-foreground/70">Be the first to review this product!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review, index) => (
                                <FadeIn key={review.id || index} delay={index * 100} className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                {review.userAvatar && <AvatarImage src={review.userAvatar} />}
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {review.userName?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-foreground">{review.userName}</h4>
                                                    {review.verified && (
                                                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                            <BadgeCheck className="h-3 w-3" />
                                                            Verified Purchase
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(review.createdAt, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-muted/50 px-2 py-1 rounded-lg">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn("h-3.5 w-3.5", i < review.rating ? "fill-golden text-golden" : "text-gray-300")}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {review.title && (
                                        <h5 className="font-semibold text-foreground mb-2">{review.title}</h5>
                                    )}
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                        {review.comment}
                                    </p>

                                    {/* Review Images */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                            {review.images.map((img, i) => (
                                                <div key={i} className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border border-border flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                                                    <img
                                                        src={img}
                                                        alt={`Review attachment ${i + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onClick={() => window.open(img, '_blank')}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Admin Reply */}
                                    {review.adminReply && (
                                        <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-xl mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BadgeCheck className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-semibold text-primary">Store Response</span>
                                            </div>
                                            <p className="text-sm text-foreground">{review.adminReply}</p>
                                        </div>
                                    )}

                                    {/* Helpful Button */}
                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <button
                                            onClick={() => handleHelpful(review.id)}
                                            disabled={helpfulClicked.has(review.id)}
                                            className={cn(
                                                "flex items-center gap-2 text-sm transition-colors",
                                                helpfulClicked.has(review.id)
                                                    ? "text-primary cursor-default"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <ThumbsUp className={cn("h-4 w-4", helpfulClicked.has(review.id) && "fill-current")} />
                                            Helpful {review.helpful ? `(${review.helpful})` : ''}
                                        </button>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ReviewSection;

