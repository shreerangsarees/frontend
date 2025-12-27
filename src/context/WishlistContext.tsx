import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface WishlistItem {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    stock: number;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    loading: boolean;
    isInWishlist: (productId: string) => boolean;
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    toggleWishlist: (productId: string) => Promise<void>;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            refreshWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const refreshWishlist = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch('/api/wishlist', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWishlist(data);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some(item => item._id === productId);
    };

    const addToWishlist = async (productId: string) => {
        if (!user) {
            toast.error('Please login to add to wishlist');
            return;
        }

        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`/api/wishlist/add/${productId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                // Ideally backend returns the added item or updated list
                // For now, we refresh. if refresh fails, we might miss the update in UI despite success toast.
                // We should check if refresh succeeded?
                // Or better, let's trust the refresh will likely succeed if the add did.
                // But to be safe, we can trigger refresh and strictly wait.

                await refreshWishlist();
                toast.success('Added to wishlist');
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to add to wishlist');
            }
        } catch (error) {
            toast.error('Failed to add to wishlist');
        }
    };

    const removeFromWishlist = async (productId: string) => {
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`/api/wishlist/remove/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setWishlist(prev => prev.filter(item => item._id !== productId));
                toast.success('Removed from wishlist');
            }
        } catch (error) {
            toast.error('Failed to remove from wishlist');
        }
    };

    const toggleWishlist = async (productId: string) => {
        if (isInWishlist(productId)) {
            await removeFromWishlist(productId);
        } else {
            await addToWishlist(productId);
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            loading,
            isInWishlist,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            refreshWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
