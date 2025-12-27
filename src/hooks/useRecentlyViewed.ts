import { useEffect, useState } from 'react';

const STORAGE_KEY = 'recently_viewed';
const MAX_ITEMS = 10;

interface RecentlyViewedProduct {
    id: string;
    name: string;
    image: string;
    price: number;
    category: string;
}

export function useRecentlyViewed() {
    const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setRecentlyViewed(JSON.parse(stored));
            } catch (e) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    // Add a product to recently viewed
    const addToRecentlyViewed = (product: RecentlyViewedProduct) => {
        // Read fresh from storage to avoid state race conditions
        // This ensures that if the state hasn't hydrated yet, we don't overwrite LS with just 1 item
        const stored = localStorage.getItem(STORAGE_KEY);
        let currentHeight: RecentlyViewedProduct[] = [];

        if (stored) {
            try {
                currentHeight = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse recently viewed", e);
            }
        }

        // Remove if already exists
        const filtered = currentHeight.filter(p => p.id !== product.id);
        // Add to beginning
        const updated = [product, ...filtered].slice(0, MAX_ITEMS);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setRecentlyViewed(updated);
    };

    // Clear all recently viewed
    const clearRecentlyViewed = () => {
        setRecentlyViewed([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed
    };
}
