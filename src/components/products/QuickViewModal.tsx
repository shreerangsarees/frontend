import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { Star, ShoppingCart, Eye, Heart, Check, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface QuickViewModalProps {
    product: Product;
    children: React.ReactNode;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, children }) => {
    const [open, setOpen] = useState(false);
    const { addItem } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const navigate = useNavigate();
    const inWishlist = isInWishlist(product.id);

    const handleAddToCart = () => {
        addItem(product);
        setOpen(false);
    };

    const handleViewDetails = () => {
        navigate(`/product/${product.id}`);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-card border-none shadow-2xl rounded-2xl gap-0">
                <div className="grid md:grid-cols-2 h-full">
                    {/* Image Side */}
                    <div className="relative bg-muted h-[300px] md:h-full">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {product.isNew && <span className="badge-new shadow-sm">NEW</span>}
                            {product.discount && <span className="badge-offer shadow-sm">{product.discount}% OFF</span>}
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="p-6 md:p-8 flex flex-col h-full bg-card">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-sm text-primary font-medium mb-1">{product.category}</p>
                                <h2 className="text-2xl font-display font-bold text-foreground line-clamp-2">{product.name}</h2>
                            </div>
                            {/* Close button is handled by DialogContent default, but we can add custom if needed */}
                        </div>

                        {/* Rating */}
                        {product.rating && (
                            <div className="flex items-center gap-1 mb-4">
                                <div className="flex text-golden">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={cn("h-4 w-4", i < Math.round(product.rating || 0) ? "fill-current" : "text-muted")}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-muted-foreground ml-2">({product.rating.toFixed(1)})</span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-3xl font-bold text-foreground">₹{product.price}</span>
                            {product.originalPrice && (
                                <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>
                            )}
                        </div>

                        <p className="text-muted-foreground text-sm line-clamp-3 mb-8 flex-1">
                            {product.description}
                        </p>

                        {/* Actions */}
                        <div className="mt-auto space-y-3">
                            <div className="flex gap-3">
                                <Button onClick={handleAddToCart} size="lg" className="flex-1 gap-2 shadow-lg shadow-primary/20" disabled={!product.isAvailable || product.stock <= 0}>
                                    <ShoppingCart className="h-5 w-5" />
                                    {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={cn("h-11 w-11 rounded-xl transition-colors", inWishlist && "text-primary border-primary bg-primary/5")}
                                    onClick={() => toggleWishlist(product.id)}
                                >
                                    <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
                                </Button>
                            </div>
                            <Button variant="ghost" className="w-full" onClick={handleViewDetails}>
                                View Full Details
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuickViewModal;
