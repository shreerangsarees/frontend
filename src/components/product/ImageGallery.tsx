import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
    images: string[];
    name: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, name }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Filter out empty strings if any
    const validImages = images.filter(img => img);

    const minSwipeDistance = 50;

    const goToNext = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % validImages.length);
    }, [validImages.length]);

    const goToPrev = useCallback(() => {
        setCurrentIndex(prev => (prev - 1 + validImages.length) % validImages.length);
    }, [validImages.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    // Touch handlers for swipe
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goToNext();
        } else if (isRightSwipe) {
            goToPrev();
        }
    };

    if (validImages.length === 0) return null;

    return (
        <div className="flex flex-col gap-4 w-full max-w-full min-w-0">
            {/* Main Image Slider */}
            <div className="relative w-full max-w-full overflow-hidden rounded-3xl border border-border bg-white">
                {/* Image container with swipe */}
                <div
                    ref={sliderRef}
                    className="relative aspect-[3/4] w-full overflow-hidden"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                >
                    {/* Slides */}
                    <div
                        className="flex transition-transform duration-300 ease-out h-full"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {validImages.map((img, index) => (
                            <div key={index} className="w-full flex-none h-full">
                                <img
                                    src={img}
                                    alt={`${name} - Image ${index + 1}`}
                                    className={cn(
                                        "w-full h-full object-cover transition-transform duration-500",
                                        isZoomed && currentIndex === index ? "scale-110" : "scale-100"
                                    )}
                                    draggable={false}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows - only show if more than 1 image */}
                {validImages.length > 1 && (
                    <>
                        <button
                            onClick={goToPrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-foreground hover:bg-white transition-colors z-10"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-foreground hover:bg-white transition-colors z-10"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                {/* Dot indicators */}
                {validImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {validImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    index === currentIndex
                                        ? "bg-primary w-6"
                                        : "bg-white/60 hover:bg-white/80"
                                )}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Thumbnails - Desktop only */}
            {validImages.length > 1 && (
                <div className="hidden sm:flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {validImages.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "flex-shrink-0 w-20 h-20 bg-white rounded-xl border-2 p-1 flex items-center justify-center transition-all hover:border-primary",
                                currentIndex === index
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-border opacity-70 hover:opacity-100"
                            )}
                        >
                            <img
                                src={img}
                                alt={`${name} thumbnail ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;

