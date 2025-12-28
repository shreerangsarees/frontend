import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X, Truck, ShieldCheck, TicketPercent } from 'lucide-react';
import { API_BASE_URL } from '@/apiConfig';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { storeInfo } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Helper component for available coupons
const AvailableCoupons = ({ onApply, cartTotal }: { onApply: (code: string) => void, cartTotal: number }) => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/coupons/active`);
        if (res.ok) {
          const data = await res.json();
          setCoupons(data);
        }
      } catch (err) {
        console.error("Failed to load coupons", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const getDiscountValue = (coupon: any) => {
    if (cartTotal < coupon.minOrderValue) return 0;
    if (coupon.discountType === 'flat') return coupon.discountAmount;
    return (cartTotal * coupon.discountAmount) / 100;
  };

  const sortedCoupons = [...coupons].sort((a, b) => getDiscountValue(b) - getDiscountValue(a));
  const bestCouponId = sortedCoupons.length > 0 && getDiscountValue(sortedCoupons[0]) > 0 ? sortedCoupons[0]._id : null;

  if (loading) return <div className="text-xs text-muted-foreground animate-pulse">Loading offers...</div>;
  if (coupons.length === 0) return null;

  return (
    <div className="space-y-3 w-full overflow-hidden">
      <p className="text-sm font-medium text-foreground flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" />
        Available Offers
      </p>
      <div className="grid grid-flow-col auto-cols-[85%] sm:auto-cols-[300px] overflow-x-auto gap-3 pb-4 snap-x scrollbar-hide w-full px-1">
        {sortedCoupons.map((coupon) => {
          const isBest = coupon._id === bestCouponId;
          const isApplicable = cartTotal >= coupon.minOrderValue;

          return (
            <div
              key={coupon._id}
              className={cn(
                "group relative overflow-hidden p-3 border rounded-lg transition-all cursor-pointer snap-start h-full",
                isBest
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-dashed border-primary/30 bg-card hover:bg-primary/5",
                !isApplicable && "opacity-60 grayscale"
              )}
              onClick={() => isApplicable && onApply(coupon.code)}
            >
              {isBest && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm z-20">
                  BEST OFFER
                </div>
              )}

              <div className="flex items-center justify-between relative z-10 h-full">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{coupon.code}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {coupon.discountType === 'flat' ? `₹${coupon.discountAmount} Off` : `${coupon.discountAmount}% Off`}
                    {coupon.minOrderValue > 0 && ` on ₹${coupon.minOrderValue}+`}
                  </p>
                  {!isApplicable && coupon.minOrderValue > 0 && (
                    <p className="text-[10px] text-destructive mt-1 font-medium">
                      Add ₹{coupon.minOrderValue - cartTotal} more
                    </p>
                  )}
                </div>
                {isApplicable && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/20 shrink-0 ml-2">
                    Apply
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Cart: React.FC = () => {
  const { items, totalAmount, updateQuantity, updateItemColor, removeItem, clearCart, applyCoupon, removeCoupon, coupon, discount, addItem, isLoaded } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = async (codeOverride?: string) => {
    const codeToUse = codeOverride || couponCode;
    if (!codeToUse?.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToUse, orderTotal: totalAmount })
      });
      const data = await res.json();
      if (res.ok) {
        applyCoupon(data);
        toast.success(`Coupon ${data.code} applied!`);
        setCouponCode('');
      } else {
        toast.error(data.message || 'Invalid coupon');
      }
    } catch (error) {
      toast.error('Error applying coupon');
    }
  };

  // Handle Reorder Items
  useEffect(() => {
    // Only proceed if cart context is fully loaded
    if (!isLoaded) return;

    const reorderItems = localStorage.getItem('reorder_items');
    if (reorderItems) {
      try {
        const itemsToReorder = JSON.parse(reorderItems);


        let addedCount = 0;

        itemsToReorder.forEach((item: any) => {
          // Robust ID extraction
          // item.product could be string ID OR populated object
          const productId = (item.product && typeof item.product === 'object' && item.product._id)
            ? item.product._id
            : (typeof item.product === 'string' ? item.product : item.id);

          if (!productId) {
            console.warn('Skipping reorder item due to missing product ID:', item);
            return;
          }

          // Construct minimal product for cart
          const product = {
            id: productId,
            name: item.name || item.product?.name || 'Reordered Item',
            price: item.price,
            image: item.image || item.product?.image || '',
            category: 'Reorder',
            description: '',
            unit: 'pc',
            stock: 100,
          };

          // console.log(`Adding to cart: ${product.name} (ID: ${product.id}) x ${item.quantity}`);

          // Add item quantity times
          for (let i = 0; i < (item.quantity || 1); i++) {
            addItem(product as any);
          }
          addedCount++;
        });

        if (addedCount > 0) {
          toast.success('Items from previous order added to cart!');
        } else {
          console.warn('No valid items found to add to cart from reorder.');
        }

        // Clear after processing
        localStorage.removeItem('reorder_items');

      } catch (e) {
        console.error("Error processing reorder items", e);
        localStorage.removeItem('reorder_items');
      }
    }
  }, [addItem, isLoaded]);

  // Dynamic Settings State
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(storeInfo.deliveryFee);
  const [minOrderFreeDelivery, setMinOrderFreeDelivery] = useState(storeInfo.minOrderFreeDelivery);

  // Fetch Store Settings
  useEffect(() => {
    fetch(`${API_BASE_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (typeof data.deliveryFee === 'number') setStandardDeliveryFee(data.deliveryFee);
          if (typeof data.minOrderFreeDelivery === 'number') setMinOrderFreeDelivery(data.minOrderFreeDelivery);
        }
      })
      .catch(err => console.error("Failed to fetch settings", err));
  }, []);

  const deliveryFee = totalAmount >= minOrderFreeDelivery ? 0 : standardDeliveryFee;
  const grandTotal = Math.max(0, totalAmount + deliveryFee - discount);
  const freeDeliveryRemaining = Math.max(0, minOrderFreeDelivery - totalAmount);

  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      toast.error("Please login to checkout");
      navigate('/auth');
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-app py-16 lg:py-24 text-center">
          <div className="max-w-md mx-auto px-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-3">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet. Valid offers and great deals are waiting for you!
            </p>
            <Link to="/products">
              <Button variant="hero" size="lg" className="rounded-full px-8">
                Start Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/30 min-h-[calc(100vh-4rem)]">
        <div className="container-app py-4 sm:py-8 lg:py-12">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                Shopping Cart
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {items.length} item{items.length !== 1 ? 's' : ''} • Total ₹{grandTotal}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={clearCart}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden sm:flex"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
            {/* Cart Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Delivery Bar - Mobile/Tablet */}
              {freeDeliveryRemaining > 0 ? (
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
                      <Truck className="h-4 w-4 text-teal" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Add <span className="text-teal font-bold">₹{freeDeliveryRemaining}</span> more for free delivery
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min((totalAmount / minOrderFreeDelivery) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-teal/10 border border-teal/20 rounded-xl p-3 flex items-center gap-3 text-teal-dark">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-medium">You've unlocked FREE delivery!</span>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.product.id}
                    className="group bg-card hover:shadow-md transition-all duration-200 rounded-xl border border-border/50 p-3 sm:p-5 flex gap-3 sm:gap-5"
                  >
                    {/* Image */}
                    <Link to={`/product/${item.product.id}`} className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg sm:rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50 block">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link to={`/product/${item.product.id}`}>
                            <h3 className="font-medium text-foreground text-sm sm:text-lg line-clamp-2 leading-tight hover:text-primary transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          <button
                            onClick={() => removeItem(item.product.id, item.selectedColor)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 -mr-2 -mt-2 sm:hidden"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{item.product.unit}</p>

                        {item.product.colors && item.product.colors.length > 0 ? (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-muted-foreground">Color:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.product.colors.map((color) => {
                                // Simple color detection for styling
                                const isSelected = item.selectedColor === color;
                                return (
                                  <button
                                    key={color}
                                    onClick={() => {
                                      if (item.selectedColor && item.selectedColor !== color) {
                                        updateItemColor(item.product.id, item.selectedColor, color);
                                      }
                                    }}
                                    className={cn(
                                      "h-5 w-5 rounded-full border shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary",
                                      isSelected ? "ring-2 ring-primary ring-offset-1 scale-110" : "hover:scale-105 opacity-70 hover:opacity-100"
                                    )}
                                    title={color}
                                    style={{ backgroundColor: color }}
                                  >
                                    <span className="sr-only">{color}</span>
                                  </button>
                                );
                              })}
                            </div>
                            {/* Fallback text if colors are weirdly named/not css valid? 
                                  Actually, usually colors are names. If styles fail, we might need a select. 
                                  But let's assume they are somewhat valid or we rely on title. 
                                  Let's add a text fallback if it's not a hex code. 
                                  Actually commonly users want to see the name if it's "Navy Blue". 
                                  Let's stick to circles as requested in product details style usually.
                              */}
                          </div>
                        ) : (
                          item.selectedColor && (
                            <p className="text-xs text-primary font-medium mt-0.5">Color: {item.selectedColor}</p>
                          )
                        )}
                      </div>

                      <div className="flex flex-wrap items-end justify-between mt-3 sm:mt-0 gap-y-3">
                        {/* Price */}
                        <div>
                          <div className="text-base sm:text-xl font-bold text-foreground">
                            ₹{item.product.price * item.quantity}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-xs text-muted-foreground">
                              ₹{item.product.price} / item
                            </div>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3 sm:gap-6">
                          <div className="flex items-center bg-muted/50 rounded-lg border border-border/50 h-8 sm:h-10">
                            <button
                              className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background rounded-l-lg transition-colors disabled:opacity-50"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <span className="w-8 text-center text-xs sm:text-sm font-medium tabular-nums">{item.quantity}</span>
                            <button
                              className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background rounded-r-lg transition-colors"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor)}
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id, item.selectedColor)}
                            className="hidden sm:flex items-center justify-center h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-4 mt-6 lg:mt-0">
              <div className="bg-card rounded-2xl border border-border shadow-sm p-4 sm:p-6 sticky top-24">
                <h2 className="text-lg font-display font-bold text-foreground mb-4">
                  Order Details
                </h2>

                {/* Coupon Section */}
                <div className="space-y-4 mb-6">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!coupon}
                        className="pr-8 uppercase placeholder:normal-case"
                      />
                      {coupon && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-success animate-pulse" />
                      )}
                    </div>
                    {coupon ? (
                      <Button variant="outline" onClick={removeCoupon} className="text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/50 hover:bg-destructive/10">
                        Remove
                      </Button>
                    ) : (
                      <Button onClick={() => handleApplyCoupon()} disabled={!couponCode} variant="secondary">
                        Apply
                      </Button>
                    )}
                  </div>

                  {!coupon && (
                    <AvailableCoupons
                      onApply={(code) => {
                        setCouponCode(code);
                        handleApplyCoupon(code);
                      }}
                      cartTotal={totalAmount}
                    />
                  )}
                </div>

                {/* Coupon Applied Status */}
                {coupon && (
                  <div className="mb-6 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium text-success-dark flex items-center gap-2">
                      <TicketPercent className="h-4 w-4" />
                      {coupon.code} applied
                    </span>
                    <span className="text-sm font-bold text-success-dark">-₹{discount}</span>
                  </div>
                )}

                {/* Bill Details */}
                <div className="space-y-3 py-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Item Total</span>
                    <span className="font-medium text-foreground">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className={cn("font-medium", deliveryFee === 0 ? "text-success" : "text-foreground")}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-border mt-3">
                    <span className="text-lg font-display font-bold text-foreground">Total Amount</span>
                    <span className="text-lg font-bold text-primary">₹{grandTotal}</span>
                  </div>
                </div>

                <div className="mt-6 hidden lg:block">
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full text-base py-6 rounded-xl shadow-primary/25"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Secure Checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4 lg:hidden z-40">
          <div className="flex gap-4 items-center max-w-md mx-auto">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total</p>
              <p className="text-xl font-bold text-foreground leading-none">₹{grandTotal}</p>
            </div>
            <Button
              variant="hero"
              size="lg"
              className="flex-1 rounded-xl shadow-primary/25"
              onClick={handleCheckout}
            >
              Checkout
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Spacer for mobile bottom bars (Nav + Checkout Bar) */}
        <div className="h-32 lg:hidden" />
      </div>
    </Layout>
  );
};

export default Cart;
