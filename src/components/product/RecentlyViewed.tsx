import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, X } from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Button } from '@/components/ui/button';

const RecentlyViewed: React.FC = () => {
    const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

    if (recentlyViewed.length === 0) {
        return null;
    }

    return (
        <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-display font-bold">Recently Viewed</h2>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentlyViewed}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {recentlyViewed.map((product) => (
                    <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="flex-shrink-0 w-32 group"
                    >
                        <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-2">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                        </div>
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                        </p>
                        <p className="text-sm font-bold text-primary">₹{product.price}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewed;
