import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '@/apiConfig';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/lib/utils';

interface Banner {
    _id: string;
    title: string;
    subtitle?: string;
    image: string;
    link?: string;
    buttonText?: string;
    createdAt?: string;
    updatedAt?: string;
}

const BannerSlideshow: React.FC = () => {
    const { socket } = useSocket();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    // Real-time updates
    useEffect(() => {
        if (socket) {
            socket.on('bannerCreated', () => fetchBanners());
            socket.on('bannerUpdated', () => fetchBanners());
            socket.on('bannerDeleted', () => fetchBanners());
            socket.on('bannersReordered', () => fetchBanners());

            return () => {
                socket.off('bannerCreated');
                socket.off('bannerUpdated');
                socket.off('bannerDeleted');
                socket.off('bannersReordered');
            };
        }
    }, [socket]);

    const fetchBanners = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/banners`);
            if (res.ok) {
                const data: Banner[] = await res.json();

                // Sort by "Recently Modified" (Newest or Just Edited -> First)
                const sorted = data.sort((a, b) => {
                    const getTime = (b: Banner) => {
                        // Use updatedAt if available, otherwise createdAt
                        const dateStr = b.updatedAt || b.createdAt;
                        return dateStr ? new Date(dateStr).getTime() : 0;
                    };
                    return getTime(b) - getTime(a);
                });

                setBanners(sorted);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        }
    };

    // Auto-play slideshow
    useEffect(() => {
        if (!isAutoPlaying || banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, banners.length]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 10 seconds
        setTimeout(() => setIsAutoPlaying(true), 10000);
    }, []);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    }, [banners.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    }, [banners.length]);

    if (banners.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full overflow-hidden rounded-2xl bg-muted">
            {/* Slides */}
            <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner) => (
                    <div key={banner._id} className="min-w-full relative">
                        {/* Mobile: Taller aspect ratio | Desktop: Wide */}
                        <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-[2.4/1]">
                            {banner.link ? (
                                <Link to={banner.link} className="block w-full h-full">
                                    <img
                                        src={banner.image}
                                        alt={banner.title}
                                        className="w-full h-full object-cover"
                                    />
                                </Link>
                            ) : (
                                <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={goToPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </>
            )}

            {/* Dots */}
            {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all",
                                index === currentIndex
                                    ? "bg-white w-8"
                                    : "bg-white/50 hover:bg-white/70"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BannerSlideshow;
