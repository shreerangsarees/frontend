import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, CheckCircle, Truck, Home, Clock, MapPin, ArrowLeft, Phone, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
  addresses: {
    label: string;
    full_address: string;
    city: string;
    pincode: string;
  } | null;
}

const orderStatuses = [
  { key: 'Placed', label: 'Order Placed', icon: Package, description: 'Your order has been received' },
  { key: 'Processing', label: 'Processing', icon: CheckCircle, description: 'T-Mart is preparing your order' },
  { key: 'Shipped', label: 'Shipped', icon: Package, description: 'Your order has been shipped' },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, description: 'Your order is on the way' },
  { key: 'Delivered', label: 'Delivered', icon: Home, description: 'Order delivered successfully' },
];

import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { socket, isConnected } = useSocket();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && user) {
      fetchOrder();
    }
  }, [orderId, user]);

  // WebSocket: Join order room and listen for status updates
  useEffect(() => {
    if (socket && orderId && isConnected) {
      // Join the specific order room
      socket.emit('joinOrderRoom', orderId);

      // Listen for status updates
      socket.on('orderStatusUpdated', (data: { orderId: string; status: string }) => {
        if (data.orderId === orderId) {
          console.log('Real-time status update received:', data.status);
          toast.success(`Order status updated to: ${data.status}`);
          setOrder(prev => prev ? { ...prev, status: data.status, updated_at: new Date().toISOString() } : null);
        }
      });

      return () => {
        socket.off('orderStatusUpdated');
      };
    }
  }, [socket, orderId, isConnected]);

  const fetchOrder = async () => {
    try {
      // Mock finding the order from API
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        // Map backend data to frontend interface
        setOrder({
          id: data._id,
          status: data.status, // Keep original status from backend
          payment_method: data.paymentMethod,
          payment_status: data.paymentMethod === 'cod' ? 'pending' : 'paid',
          subtotal: data.totalAmount - (data.deliveryFee || 0),
          delivery_fee: data.deliveryFee || 0,
          total_amount: data.totalAmount,
          estimated_delivery: '30-45 mins',
          created_at: data.createdAt,
          updated_at: data.updatedAt,
          addresses: data.shippingAddress
        });
        setOrderItems(data.items.map((i: any) => ({
          id: i._id,
          product_name: i.product?.name || 'Product',
          product_image: i.product?.image || null,
          quantity: i.quantity,
          price: i.price
        })));
      } else {
        console.error('Failed to fetch order');
        setOrder(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const subscribeToOrderUpdates = () => {
    // Supabase subscription removed
    return () => { };
  };

  const getCurrentStatusIndex = () => {
    if (!order) return -1;
    return orderStatuses.findIndex(s => s.key === order.status);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container-app py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-coral" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container-app py-16 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">
            Order not found
          </h1>
          <Link to="/">
            <Button variant="hero">Go to Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();
  const isCancelled = order.status === 'Cancelled';

  return (
    <Layout>
      <div className="container-app py-6 sm:py-8">
        {/* Back button */}
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Orders
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Status timeline */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-display font-bold text-foreground">
                    Order #{order.id.slice(0, 8)}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {order.estimated_delivery && (
                  <div className="flex items-center gap-2 bg-coral-light text-coral px-4 py-2 rounded-xl">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{order.estimated_delivery}</span>
                  </div>
                )}
              </div>

              {/* Status timeline */}
              {isCancelled ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-destructive" />
                  </div>
                  <h2 className="text-xl font-bold text-destructive">Order Cancelled</h2>
                  <p className="text-muted-foreground mt-2">This order has been cancelled</p>
                </div>
              ) : (
                <div className="relative">
                  {orderStatuses.map((status, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const Icon = status.icon;

                    return (
                      <div key={status.key} className="flex gap-4 mb-6 last:mb-0">
                        {/* Line */}
                        {index < orderStatuses.length - 1 && (
                          <div
                            className={cn(
                              "absolute left-5 w-0.5 h-16 translate-y-12",
                              isCompleted ? "bg-coral" : "bg-border"
                            )}
                            style={{ top: `${index * 88}px` }}
                          />
                        )}

                        {/* Icon */}
                        <div
                          className={cn(
                            "relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                            isCompleted
                              ? "bg-coral text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isCurrent && isCompleted ? (
                            <div className="absolute inset-0 rounded-full bg-coral animate-ping opacity-50" />
                          ) : null}
                          <Icon className="h-5 w-5 relative z-10" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <h3
                            className={cn(
                              "font-medium",
                              isCompleted ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {status.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {status.description}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-coral mt-1">
                              Updated {new Date(order.updated_at).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order items */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-display font-bold text-foreground mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.product_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <span className="font-medium text-foreground">
                      ₹{item.quantity * item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 space-y-6">
              {/* Delivery address */}
              {order.addresses && (
                <div>
                  <h3 className="font-medium text-foreground flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-coral" />
                    Delivery Address
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {order.addresses.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.addresses.full_address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.addresses.city} - {order.addresses.pincode}
                  </p>
                </div>
              )}

              {/* Payment info */}
              <div>
                <h3 className="font-medium text-foreground mb-2">Payment</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">
                    {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                  </span>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                    order.payment_status === 'paid' ? "bg-success/10 text-success" : "bg-golden/10 text-golden"
                  )}>
                    {order.payment_status}
                  </span>
                </div>
              </div>

              {/* Price summary */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={cn("font-medium", order.delivery_fee === 0 && "text-success")}>
                    {order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-display font-bold text-foreground">Total</span>
                  <span className="text-xl font-bold text-coral">₹{order.total_amount}</span>
                </div>
              </div>

              {/* Help */}
              <a href="tel:7096867438" className="block">
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Need Help? Call 7096867438
                </Button>
              </a>

              {/* Cancel Order - only show if not delivered or cancelled */}
              {!['Delivered', 'Cancelled', 'Out for Delivery'].includes(order.status) && (
                <Button
                  variant="destructive"
                  className="w-full mt-3"
                  onClick={async () => {
                    if (confirm('Are you sure you want to cancel this order? For prepaid orders, a refund will be initiated.')) {
                      try {
                        const res = await fetch(`/api/orders/${order.id}/cancel`, {
                          method: 'PUT'
                        });
                        const data = await res.json();
                        if (res.ok) {
                          toast.success('Order cancelled successfully');
                          if (data.refundMessage) {
                            // Show refund info in a separate toast
                            setTimeout(() => {
                              toast.info(data.refundMessage, { duration: 8000 });
                            }, 500);
                          }
                          setOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
                        } else {
                          toast.error(data.message || 'Failed to cancel order');
                        }
                      } catch (error) {
                        toast.error('Error cancelling order');
                      }
                    }
                  }}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderTracking;
