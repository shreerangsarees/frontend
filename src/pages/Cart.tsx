import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MapPin, TicketPercent, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { storeInfo } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Helper component for available coupons
const AvailableCoupons = ({ onApply }: { onApply: (code: string) => void }) => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch('/api/coupons/active');
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

  if (loading) return <div className="text-xs text-muted-foreground">Loading offers...</div>;
  if (coupons.length === 0) return <div className="text-xs text-muted-foreground">No active coupons.</div>;

  return (
    <>
      {coupons.map((coupon) => (
        <div key={coupon._id} className="p-2 border border-border rounded-lg bg-muted/30 flex items-center justify-between cursor-pointer hover:bg-muted/50" onClick={() => onApply(coupon.code)}>
          <div className="flex items-center gap-2">
            <TicketPercent className="h-4 w-4 text-coral" />
            <div>
              <p className="font-bold text-sm text-foreground">{coupon.code}</p>
              <p className="text-xs text-muted-foreground">
                {coupon.discountType === 'flat' ? `₹${coupon.discountAmount} Off` : `${coupon.discountAmount}% Off`}
                {coupon.minOrderValue > 0 && ` on orders above ₹${coupon.minOrderValue}`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-xs text-coral">Apply</Button>
        </div>
      ))}
    </>
  );
};

const Cart: React.FC = () => {
  const { items, totalAmount, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon, coupon, discount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = async () => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: totalAmount })
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

  const deliveryFee = totalAmount >= 499 ? 0 : storeInfo.deliveryFee;
  const grandTotal = Math.max(0, totalAmount + deliveryFee - discount);
  const freeDeliveryRemaining = Math.max(0, 499 - totalAmount);

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-app py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/products">
              <Button variant="hero" size="lg">
                Start Shopping
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-app py-6 sm:py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Your Cart
            </h1>
            <p className="text-muted-foreground mt-1">
              {items.length} item{items.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div
                key={item.product.id}
                className={cn(
                  "flex gap-4 p-4 bg-card rounded-2xl border border-border",
                  "opacity-0 animate-slide-up"
                )}
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                {/* Product image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground line-clamp-1">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.product.unit}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-foreground">
                        ₹{item.product.price * item.quantity}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ₹{item.product.price} each
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-muted rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(item.product.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              <h2 className="text-lg font-display font-bold text-foreground mb-4">
                Order Summary
              </h2>

              {/* Free delivery progress */}
              {freeDeliveryRemaining > 0 && (
                <div className="mb-4 p-3 bg-teal-light rounded-xl">
                  <p className="text-sm text-teal font-medium">
                    Add ₹{freeDeliveryRemaining} more for free delivery!
                  </p>
                  <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((totalAmount / 499) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Coupon Input */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!coupon}
                />
                {coupon ? (
                  <Button variant="outline" onClick={removeCoupon}>
                    Remove
                  </Button>
                ) : (
                  <Button onClick={handleApplyCoupon} disabled={!couponCode}>
                    Apply
                  </Button>
                )}
              </div>

              {/* Available Coupons List */}
              {!coupon && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground mb-2">Available Offers:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    <AvailableCoupons onApply={(code) => setCouponCode(code)} />
                  </div>
                </div>
              )}

              {/* Price breakdown */}
              <div className="space-y-2 py-4 border-t border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className={cn("font-medium", deliveryFee === 0 && "text-success")}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount ({coupon?.code})</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between py-4">
                <span className="font-display font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-coral">₹{grandTotal}</span>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => {
                  if (user) {
                    navigate('/checkout');
                  } else {
                    toast.error("Please login to checkout");
                    navigate('/auth');
                  }
                }}
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
