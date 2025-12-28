import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { API_BASE_URL } from '@/apiConfig';
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/lib/utils';

interface Testimonial {
    _id: string;
    name: string;
    avatar?: string;
    rating: number;
    comment: string;
    location?: string;
}

const TestimonialsSection: React.FC = () => {
    const { socket } = useSocket();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    // Real-time updates
    useEffect(() => {
        if (socket) {
            socket.on('testimonialCreated', () => fetchTestimonials());
            socket.on('testimonialUpdated', () => fetchTestimonials());
            socket.on('testimonialDeleted', () => fetchTestimonials());

            return () => {
                socket.off('testimonialCreated');
                socket.off('testimonialUpdated');
                socket.off('testimonialDeleted');
            };
        }
    }, [socket]);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/testimonials`);
            if (res.ok) {
                const data = await res.json();
                setTestimonials(data);
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        }
    };

    // Auto-rotate testimonials
    useEffect(() => {
        if (testimonials.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [testimonials.length]);

    if (testimonials.length === 0) {
        return null;
    }

    const visibleCount = Math.min(testimonials.length, 3);
    const getVisibleTestimonials = () => {
        const visible = [];
        for (let i = 0; i < visibleCount; i++) {
            const index = (currentIndex + i) % testimonials.length;
            visible.push(testimonials[index]);
        }
        return visible;
    };

    return (
        <section className="py-12 bg-muted/30">
            <div className="container-app">
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
                        What Our Customers Say
                    </h2>
                    <p className="text-muted-foreground">
                        Real reviews from our satisfied customers
                    </p>
                </div>

                {/* Desktop: Show multiple testimonials */}
                <div className="hidden md:grid md:grid-cols-3 gap-6">
                    {getVisibleTestimonials().map((testimonial, idx) => (
                        <TestimonialCard key={testimonial._id} testimonial={testimonial} delay={idx * 100} />
                    ))}
                </div>

                {/* Mobile: Show single testimonial with navigation */}
                <div className="md:hidden relative">
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-500"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {testimonials.map((testimonial) => (
                                <div key={testimonial._id} className="min-w-full px-1">
                                    <TestimonialCard testimonial={testimonial} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation dots */}
                    <div className="flex justify-center gap-2 mt-6">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    index === currentIndex
                                        ? "bg-primary w-6"
                                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const TestimonialCard: React.FC<{ testimonial: Testimonial; delay?: number }> = ({ testimonial, delay = 0 }) => (
    <div
        className="bg-card rounded-2xl border border-border p-6 relative animate-fade-in"
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Quote icon */}
        <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />

        <div className="flex items-center gap-4 mb-4">
            {testimonial.avatar ? (
                <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                />
            ) : (
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-2 border-primary/20">
                    {testimonial.name.charAt(0)}
                </div>
            )}
            <div>
                <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                {testimonial.location && (
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                )}
            </div>
        </div>

        {/* Stars */}
        <div className="flex gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        "h-4 w-4",
                        star <= testimonial.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                    )}
                />
            ))}
        </div>

        <p className="text-muted-foreground leading-relaxed">
            "{testimonial.comment}"
        </p>
    </div>
);

export default TestimonialsSection;
