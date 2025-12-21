import React from 'react';
import { Plus, Minus, Star } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    addItem(product);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border border-border overflow-hidden card-hover",
        className
      )}
    >
      {/* Image container */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="badge-new">NEW</span>
          )}
          {product.discount && (
            <span className="badge-offer">{product.discount}% OFF</span>
          )}
          {(!product.isAvailable || product.stock <= 0) && (
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
          )}
        </div>
      </Link>

      {/* Quick add overlay - Only show if not in cart AND in stock */}
      {quantity === 0 && product.stock > 0 && product.isAvailable && (
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 pointer-events-none">
          <Button
            onClick={(e) => {
              e.preventDefault(); // Prevent Link click
              handleAddToCart();
            }}
            className="transform translate-y-4 group-hover:translate-y-0 transition-transform pointer-events-auto"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </div>
      )}

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
          <h3 className="font-medium text-foreground line-clamp-2 mb-1 group-hover:text-coral transition-colors">
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
            <div className="flex items-center gap-1 bg-coral rounded-lg">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDecrement}
                className="text-primary-foreground hover:bg-coral-dark rounded-lg"
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
                className="text-primary-foreground hover:bg-coral-dark rounded-lg"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToCart}
              className="sm:hidden"
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
