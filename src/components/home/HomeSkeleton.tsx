import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';

const HomeSkeleton: React.FC = () => {
    return (
        <div className="bg-muted/30 min-h-screen pb-20 space-y-8">
            {/* Banner Skeleton */}
            <div className="container-app py-4">
                <Skeleton className="w-full aspect-[21/9] sm:aspect-[2.5/1] rounded-2xl" />
            </div>

            {/* Coupon Banner Skeleton */}
            <div className="container-app py-4">
                <Skeleton className="w-full h-24 rounded-xl" />
            </div>

            {/* Categories Skeleton */}
            <div className="container-app">
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Shop By Occasion Skeleton */}
            <div className="container-app">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
                    ))}
                </div>
            </div>

            {/* Product Carousel Skeleton 1 */}
            <div className="container-app py-8">
                <div className="flex justify-between mb-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </div>

            {/* Spotlight Collection Skeleton */}
            <div className="w-full h-[500px]">
                <Skeleton className="w-full h-full" />
            </div>

            {/* Product Carousel Skeleton 2 */}
            <div className="container-app py-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeSkeleton;
