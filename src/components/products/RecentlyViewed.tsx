import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 10;

// Helper functions for managing recently viewed products
export const addToRecentlyViewed = (product: Product) => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        let products: Product[] = stored ? JSON.parse(stored) : [];

        // Remove if already exists
        products = products.filter(p => p.id !== product.id);

        // Add to beginning
        products.unshift(product);

        // Keep only MAX_ITEMS
        products = products.slice(0, MAX_ITEMS);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
        console.error('Error saving to recently viewed:', error);
    }
};

export const getRecentlyViewed = (): Product[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading recently viewed:', error);
        return [];
    }
};

export const clearRecentlyViewed = () => {
    localStorage.removeItem(STORAGE_KEY);
};

interface RecentlyViewedProps {
    currentProductId?: string; // Exclude current product if viewing details
    maxDisplay?: number;
    className?: string;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
    currentProductId,
    maxDisplay = 4,
    className
}) => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const viewed = getRecentlyViewed();
        // Filter out current product if provided
        const filtered = currentProductId
            ? viewed.filter(p => p.id !== currentProductId)
            : viewed;
        setProducts(filtered.slice(0, maxDisplay));
    }, [currentProductId, maxDisplay]);

    if (products.length === 0) {
        return null;
    }

    return (
        <section className={cn("py-8", className)}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-bold text-foreground">
                            Recently Viewed
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Continue where you left off
                        </p>
                    </div>
                </div>
                <Link
                    to="/products"
                    className="hidden sm:flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                >
                    View All Products
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="opacity-0 animate-scale-in"
                        style={{
                            animationDelay: `${index * 0.1}s`,
                            animationFillMode: 'forwards'
                        }}
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RecentlyViewed;
