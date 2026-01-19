import React, { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/motion';
import ImageUpload from '@/components/ui/ImageUpload';
import api from '@/api/axios';

interface RatingSectionProps {
    productId: string;
    productName: string;
    onRatingSubmit?: (newReview?: any) => void;
}

const RatingSection: React.FC<RatingSectionProps> = ({ productId, productName, onRatingSubmit }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to review');
            return;
        }
        if (rating === 0) {
            toast.error('Please select a star rating');
            return;
        }

        try {
            // Submitting review
            // Use axios instance to ensure auth token is sent
            const res = await api.post('/reviews', {
                productId,
                rating,
                comment: review, // Send as 'comment' directly to match backend
                title: review.substring(0, 50) + (review.length > 50 ? '...' : ''),
                images
            });

            if (res.status === 201) {
                toast.success('Thank you for your review!');
                setReview('');
                setImages([]);
                setRating(0);
                if (onRatingSubmit) onRatingSubmit(res.data); // Pass res.data
            } else {
                toast.error('Failed to submit review');
            }
        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Something went wrong');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FadeIn direction="up" delay={200} className="bg-card rounded-3xl p-6 sm:p-8 border border-border mt-12">
            <h3 className="text-2xl font-display font-bold mb-6">Rate & Review</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating Input */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Your Rating</label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={cn(
                                        "h-8 w-8 transition-colors duration-200",
                                        (hoverRating || rating) >= star ? "fill-golden text-golden" : "text-muted-foreground/30"
                                    )}
                                />
                            </button>
                        ))}
                        <span className="ml-3 text-lg font-medium text-primary">
                            {(hoverRating || rating) > 0 ? (
                                ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][(hoverRating || rating) - 1]
                            ) : (
                                <span className="text-muted-foreground/50 text-sm font-normal">Select stars</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Your Review (Optional)</label>
                    <Textarea
                        placeholder={`Share your thoughts on ${productName}...`}
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="min-h-[120px] resize-none bg-muted/30 focus:bg-white transition-colors"
                    />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Add Photos</label>
                    <ImageUpload
                        value={images}
                        onChange={(urls) => setImages(urls as string[])}
                        folder="reviews"
                        allowMultiple={true}

                    />
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting || rating === 0}
                        className="min-w-[150px]"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Send className="h-4 w-4 mr-2" />
                        )}
                        Submit Review
                    </Button>
                </div>
            </form>
        </FadeIn>
    );
};

export default RatingSection;
