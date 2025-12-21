import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Plus, CreditCard, Banknote, Smartphone, Check, ArrowLeft, Loader2, TicketPercent } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { storeInfo } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Address } from '@/types';

/* AvailableCoupons removed - logic moved to Cart */

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile, loading: authLoading } = useAuth();
  const { items, totalAmount, clearCart, discount, coupon } = useCart();

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to continue");
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'upi'>('cod');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
      setLoadingAddresses(false);

      const defaultAddr = user.addresses.find(a => a.is_default);
      if (defaultAddr && !selectedAddress) {
        setSelectedAddress(defaultAddr._id || defaultAddr.id || null);
      }
    } else {
      setLoadingAddresses(false);
    }
  }, [user]);

  // New address form
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    full_address: '',
    city: '',
    pincode: '',
  });

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAddress,
          is_default: addresses.length === 0
        })
      });

      if (!res.ok) throw new Error('Failed to add address');

      await refreshProfile();
      toast.success('Address added successfully');
      setNewAddress({ label: 'Home', full_address: '', city: '', pincode: '' });
      setShowAddAddress(false);
    } catch (error) {
      toast.error('Error saving address');
    }
  };

  // Fake User for Razorpay if not provided
  const userName = user?.name || 'Guest User';
  const userEmail = user?.email || 'guest@example.com';

  const [shippingCost, setShippingCost] = useState(storeInfo.deliveryFee);

  // Check first delivery free
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/orders/count');
        if (res.ok) {
          const data = await res.json();
          if (data.count === 0 && totalAmount >= 0) { // If first order
            setShippingCost(0);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkEligibility();
  }, [user, totalAmount]);

  const deliveryFee = totalAmount >= storeInfo.minOrderFreeDelivery ? 0 : shippingCost;

  /* Local coupon state removed. Using Context. */

  /* Local applyCoupon removed */

  const grandTotal = Math.max(0, totalAmount + deliveryFee - discount);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress || items.length === 0) {
      toast.error('Please select an address');
      return;
    }

    const addressDetails = addresses.find(a => (a._id || a.id) === selectedAddress);

    setPlacingOrder(true);

    try {
      const orderPayload = {
        items: items.map(item => ({
          product: (item.product as any)._id || item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: grandTotal,
        shippingAddress: addressDetails, // assuming full object is desired or mapped in backend
        paymentMethod
      };

      if (paymentMethod === 'cod') {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create order');

        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/order-success/${data._id}`);
      } else {
        // Razorpay Flow
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          toast.error('Razorpay SDK failed to load');
          return;
        }

        // Create Order in Backend
        const orderRes = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: grandTotal })
        });

        if (!orderRes.ok) throw new Error('Failed to initiate payment');
        const orderData = await orderRes.json();

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_Ru8zWOt0v2kEu3",
          amount: orderData.amount,
          currency: orderData.currency,
          name: "T-Mart Express",
          description: "Order Payment",
          order_id: orderData.id,
          handler: async function (response: any) {
            // Verify Payment
            try {
              const verifyRes = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderDetails: orderPayload // Pass details to save after verification
                })
              });
              if (verifyRes.ok) {
                const verifyData = await verifyRes.json();
                toast.success('Payment Successful!');
                clearCart();
                // Assuming verify returns the order or ID. If not, fallback to /my-orders
                navigate(verifyData._id ? `/order-success/${verifyData._id}` : '/my-orders');
              } else {
                toast.error('Payment verification failed');
              }
            } catch (err) {
              console.error(err);
              toast.error('Payment verification error');
            }
          },
          prefill: {
            name: userName, // Use the safe variable
            email: userEmail,
            contact: ""
          },
          theme: {
            color: "#FF6B00"
          }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
      }

    } catch (error: any) {
      console.error('Order error:', error);
      toast.error(error.message || 'Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container-app py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-coral" />
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-app py-16 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">
            Your cart is empty
          </h1>
          <Link to="/products">
            <Button variant="hero">Continue Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-app py-6 sm:py-8">
        {/* Back button */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-6">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-coral" />
                  Delivery Address
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddAddress(!showAddAddress)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </Button>
              </div>

              {/* Add address form */}
              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-muted/50 rounded-xl space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Label</label>
                      <Input
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        placeholder="Home, Office, etc."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">City</label>
                      <Input
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Full Address</label>
                    <Input
                      value={newAddress.full_address}
                      onChange={(e) => setNewAddress({ ...newAddress, full_address: e.target.value })}
                      placeholder="House/Flat No., Street, Landmark"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Pincode</label>
                      <Input
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        placeholder="400001"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">Save Address</Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddAddress(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Address list */}
              {loadingAddresses ? (
                <div className="flex justify-center py-8">
                  {(() => { if (loadingAddresses) setTimeout(() => setLoadingAddresses(false), 500); return null; })()}
                  <Loader2 className="h-6 w-6 animate-spin text-coral" />
                </div>
              ) : addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address._id || address.id}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        selectedAddress === (address._id || address.id)
                          ? "border-coral bg-coral-light"
                          : "border-border hover:border-coral/50"
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address._id || address.id}
                        checked={selectedAddress === (address._id || address.id)}
                        onChange={() => setSelectedAddress(address._id || address.id || null)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{address.label}</span>
                          {address.is_default && (
                            <span className="text-xs bg-coral text-primary-foreground px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {address.full_address}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.city} - {address.pincode}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No saved addresses. Add a new address to continue.
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-coral" />
                Payment Method
              </h2>

              <div className="space-y-3">
                <label
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    paymentMethod === 'cod'
                      ? "border-coral bg-coral-light"
                      : "border-border hover:border-coral/50"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <Banknote className="h-6 w-6 text-foreground" />
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Cash on Delivery</span>
                    <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </label>

                <label
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    paymentMethod === 'card'
                      ? "border-coral bg-coral-light"
                      : "border-border hover:border-coral/50"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <CreditCard className="h-6 w-6 text-foreground" />
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Credit/Debit Card</span>
                    <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                  </div>
                </label>

                <label
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    paymentMethod === 'upi'
                      ? "border-coral bg-coral-light"
                      : "border-border hover:border-coral/50"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  <Smartphone className="h-6 w-6 text-foreground" />
                  <div className="flex-1">
                    <span className="font-medium text-foreground">UPI</span>
                    <p className="text-sm text-muted-foreground">Pay using Google Pay, PhonePe, etc.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              <h2 className="text-lg font-display font-bold text-foreground mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × ₹{item.product.price}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Info */}
              {coupon ? (
                <div className="flex justify-between items-center mb-4 p-2 bg-success-light rounded-lg border border-success">
                  <div className="flex items-center gap-2">
                    <TicketPercent className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium">Coupon {coupon.code} applied</span>
                  </div>
                  <span className="text-sm font-bold text-success">-₹{discount}</span>
                </div>
              ) : (
                <div className="mb-4 text-sm text-muted-foreground">
                  No coupon applied. <Link to="/cart" className="text-coral underline">Go to Cart</Link> to apply.
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
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || placingOrder}
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Place Order
                  </>
                )}
              </Button>

              {/* Validation message when address not selected */}
              {!selectedAddress && addresses.length === 0 && (
                <p className="text-sm text-destructive text-center mt-3 flex items-center justify-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Please add a delivery address to continue
                </p>
              )}
              {!selectedAddress && addresses.length > 0 && (
                <p className="text-sm text-destructive text-center mt-3 flex items-center justify-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Please select a delivery address
                </p>
              )}

              <p className="text-xs text-muted-foreground text-center mt-4">
                Estimated delivery: {storeInfo.estimatedDeliveryTime}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
