import React from 'react';
import { Plus, Minus, Star, Heart } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const quantity = getItemQuantity(product.id);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product.colors && product.colors.length > 0) {
      // Auto-select the first color if none selected (since this is direct add)
      addItem({ ...product, selectedColor: product.colors[0] });
    } else {
      addItem(product);
    }
  };

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      className={cn(
        "group relative bg-card rounded-[1.5rem] border border-transparent hover:border-primary/10 overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] min-w-0 w-full",
        className
      )}
    >
      {/* Image container - 3:4 aspect ratio */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] w-full overflow-hidden bg-muted/20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          loading="lazy"
        />

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className={cn(
            "absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all z-20 hover:scale-110 active:scale-95",
            inWishlist && "bg-primary/10 hover:bg-primary/20"
          )}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              inWishlist ? "fill-primary text-primary" : "text-slate-600 hover:text-primary"
            )}
          />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {product.isNew && (
            <span className="badge-new shadow-sm">NEW</span>
          )}
          {product.discount > 0 && (
            <span className="badge-offer shadow-sm">{product.discount}% OFF</span>
          )}
          {(!product.isAvailable || product.stock <= 0) ? (
            <span className="bg-slate-900/90 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">Out of Stock</span>
          ) : product.stock <= 5 ? (
            <span className="bg-orange-500/90 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md animate-pulse">Only {product.stock} Left</span>
          ) : null}
        </div>
      </Link>



      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground capitalize">
            {product.category?.replace('-', ' ') || 'General'}
          </span>
          {product.rating && (
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-golden text-golden" />
              <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Unit */}
        {product.unit && (
          <p className="text-xs text-muted-foreground mb-2">{product.unit}</p>
        )}

        {/* Price & Add button */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* Quantity controls or Add button - Mobile/Always Visible */}
          {quantity > 0 ? (
            <div className="flex items-center gap-1 bg-primary rounded-lg">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDecrement}
                className="text-primary-foreground hover:bg-primary-dark rounded-lg"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-6 text-center text-sm font-semibold text-primary-foreground">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleIncrement}
                className="text-primary-foreground hover:bg-primary-dark rounded-lg"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.isAvailable || product.stock <= 0}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
