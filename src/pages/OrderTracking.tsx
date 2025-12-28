import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, CheckCircle, Truck, Home, Clock, MapPin, ArrowLeft, Phone, Loader2, Download, RefreshCw, RotateCcw } from 'lucide-react';
import { formatOrderId } from '@/lib/formatters';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { formatDate, formatTime } from '@/lib/dateUtils';

import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/apiConfig';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  selected_color?: string;
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
  transaction_id: string | null;
  addresses: {
    label: string;
    full_address: string;
    city: string;
    pincode: string;
  } | null;
  refundStatus?: 'not_initiated' | 'processing' | 'completed' | 'failed';
  returnRejectionReason?: string;
}

const orderStatuses = [
  { key: 'Placed', label: 'Order Placed', icon: Package, description: 'Your order has been received' },
  { key: 'Processing', label: 'Processing', icon: CheckCircle, description: 'Shreerang is preparing your order' },
  { key: 'Shipped', label: 'Shipped', icon: Package, description: 'Your order has been shipped' },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, description: 'Your order is on the way' },
  { key: 'Delivered', label: 'Delivered', icon: Home, description: 'Order delivered successfully' },
];

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { socket, isConnected } = useSocket();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [otherReturnReason, setOtherReturnReason] = useState('');
  const [requestType, setRequestType] = useState<'return' | 'replace'>('return');

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
      socket.on('orderStatusUpdated', (data: { orderId: string; status: string; paymentStatus?: string }) => {
        if (data.orderId === orderId) {
          console.log('Real-time status update received:', data);
          toast.success(`Order status updated to: ${data.status}`);
          setOrder(prev => prev ? {
            ...prev,
            status: data.status,
            // Update payment status if provided, or default to current logic
            payment_status: data.paymentStatus ? data.paymentStatus.toLowerCase() : prev.payment_status,
            updated_at: new Date().toISOString()
          } : null);
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
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        // Map backend data to frontend interface
        // Derive payment status for legacy data or current state
        const isCod = data.paymentMethod && data.paymentMethod.toLowerCase() === 'cod';
        const isDelivered = data.status === 'Delivered';
        // If DB has explicit status, use it. But if it's 'pending' and we know it's Delivered+COD, show 'paid'.
        // Actually, let's trust DB if 'paid'. If 'pending'/'undefined', check derived.
        let displayPaymentStatus = data.paymentStatus;

        if (!displayPaymentStatus || displayPaymentStatus === 'pending') {
          if (isCod) {
            displayPaymentStatus = isDelivered ? 'paid' : 'pending';
          } else {
            displayPaymentStatus = 'paid'; // Online payments assumed paid
          }
        }

        setOrder({
          id: data._id,
          status: data.status,
          payment_method: data.paymentMethod,
          payment_status: displayPaymentStatus,
          subtotal: data.totalAmount - (data.deliveryFee || 0),
          delivery_fee: data.deliveryFee || 0,
          total_amount: data.totalAmount,
          estimated_delivery: '3-5 business days',
          created_at: data.createdAt,
          updated_at: data.updatedAt,
          transaction_id: data.paymentInfo?.razorpay_payment_id || null,

          addresses: data.shippingAddress,
          refundStatus: data.refundStatus,
          returnRejectionReason: data.returnRejectionReason
        });
        setOrderItems(data.items.map((i: any) => ({
          id: i._id,
          // Correctly map product name: Check snapshot name first, then populated product name
          product_name: i.name || (i.product && i.product.name) || 'Product',
          product_id: i.product && (i.product._id || i.product), // Ensure we get the string ID
          product_image: i.image || (i.product && i.product.image) || null,
          quantity: i.quantity,
          price: i.price,
          selected_color: i.selectedColor
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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                    Order #{formatOrderId(order.id)}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatDate(order.created_at, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {order.estimated_delivery && (
                  <div className="flex items-center gap-2 bg-primary-light text-primary px-4 py-2 rounded-xl">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{order.estimated_delivery}</span>
                  </div>
                )}
              </div>

              {/* Rejection Notification */}
              {order.status === 'Delivered' && order.returnRejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {/* We need to import AlertTriangle if not present, replacing with generic warning icon for now or ensuring import */}
                    <h3 className="font-bold text-red-800">Return/Replacement Request Rejected</h3>
                  </div>
                  <p className="text-sm text-red-700">
                    Your request was rejected. Reason: <span className="font-semibold">{order.returnRejectionReason}</span>
                  </p>
                </div>
              )}

              {/* Status timeline */}
              {isCancelled ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-destructive" />
                  </div>
                  <h2 className="text-xl font-bold text-destructive">Order Cancelled</h2>
                  <div className="mt-4 max-w-md mx-auto">
                    <p className="text-muted-foreground mb-4">This order has been cancelled.</p>

                    {order.payment_method !== 'cod' && (
                      <div className="bg-muted p-4 rounded-xl border border-border text-left">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Refund Status</span>
                          <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full uppercase",
                            order.refundStatus === 'completed' ? "bg-green-100 text-green-700" :
                              order.refundStatus === 'processing' ? "bg-blue-100 text-blue-700" :
                                order.refundStatus === 'failed' ? "bg-red-100 text-red-700" :
                                  "bg-gray-100 text-gray-700"
                          )}>
                            {order.refundStatus || 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Refunds are done typically in 7-10 days.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : order.status === 'Return Requested' || order.status === 'Replacement Requested' ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <RotateCcw className="h-8 w-8 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-orange-600">{order.status}</h2>
                  <p className="text-muted-foreground mt-2">Your {order.status === 'Replacement Requested' ? 'replacement' : 'return'} request has been received and is being processed.</p>
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
                              isCompleted ? "bg-primary" : "bg-border"
                            )}
                            style={{ top: `${index * 88}px` }}
                          />
                        )}

                        {/* Icon */}
                        <div
                          className={cn(
                            "relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isCurrent && isCompleted ? (
                            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50" />
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
                            <p className="text-xs text-primary mt-1">
                              Updated {formatTime(order.updated_at)}
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
                  <div key={item.id} className="flex gap-4 items-center">
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
                      {item.selected_color && (
                        <p className="text-sm text-muted-foreground">
                          Color: {item.selected_color}
                        </p>
                      )}
                      {/* Rate Product Button - Only if Delivered */}
                      {order && order.status === 'Delivered' && (
                        <div className="mt-2">
                          <Link to={`/product/${item.product_id}?rate=true`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs border-primary/20 text-primary hover:bg-primary/5">
                              Rate Product
                            </Button>
                          </Link>
                        </div>
                      )}
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
                    <MapPin className="h-4 w-4 text-primary" />
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
                {order.transaction_id && (
                  <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Transaction ID</p>
                    <p className="text-sm font-mono font-medium text-foreground break-all">
                      {order.transaction_id}
                    </p>
                  </div>
                )}
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
                  <span className="text-xl font-bold text-primary">₹{order.total_amount}</span>
                </div>
              </div>

              {/* Download Invoice - for all orders */}
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('tmart_token');
                    const res = await fetch(`${API_BASE_URL}/invoices/${order.id}`, {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });

                    if (res.ok) {
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Invoice-${order.id.slice(-6).toUpperCase()}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    } else {
                      toast.error('Failed to download invoice');
                    }
                  } catch (e) {
                    console.error(e);
                    toast.error('Error downloading invoice');
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>

              {/* Cancel Order - Only for Pending or Processing */}
              {['Pending', 'Processing'].includes(order.status) && (
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Cancel Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Order</DialogTitle>
                      <DialogDescription>
                        Please tell us why you want to cancel. This helps us improve.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-4">
                      {['Changed my mind', 'Found better price elsewhere', 'Ordered by mistake', 'Delivery taking too long'].map((r) => (
                        <div key={r} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={r}
                            name="cancelReason"
                            value={r}
                            checked={cancellationReason === r}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <label htmlFor={r} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {r}
                          </label>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="Other"
                          name="cancelReason"
                          value="Other"
                          checked={cancellationReason === 'Other'}
                          onChange={(e) => setCancellationReason(e.target.value)}
                        />
                        <label htmlFor="Other" className="text-sm font-medium leading-none">Other</label>
                      </div>
                      {cancellationReason === 'Other' && (
                        <textarea
                          className="w-full border rounded-md p-2 text-sm mt-2"
                          placeholder="Please specify reason..."
                          value={otherReason}
                          onChange={e => setOtherReason(e.target.value)}
                        />
                      )}
                    </div>

                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)}>Keep Order</Button>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          const finalReason = cancellationReason === 'Other' ? otherReason : cancellationReason;
                          if (!finalReason) {
                            toast.error("Please select a reason");
                            return;
                          }

                          try {
                            const token = localStorage.getItem('tmart_token');
                            const res = await fetch(`${API_BASE_URL}/orders/${order.id}/cancel`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ reason: finalReason })
                            });
                            const data = await res.json();
                            if (res.ok) {
                              toast.success('Order cancelled successfully');
                              setOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
                              setIsCancelDialogOpen(false);
                            } else {
                              toast.error(data.message || 'Failed to cancel order');
                            }
                          } catch (error) {
                            toast.error('Error cancelling order');
                          }
                        }}
                        disabled={!cancellationReason || (cancellationReason === 'Other' && !otherReason)}
                      >
                        Confirm Cancellation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Return Order - Only if Delivered and within 7 days */}
              {order.status === 'Delivered' && (
                (() => {
                  const deliveryDate = new Date(order.updated_at);
                  const currentDate = new Date();
                  const diffTime = Math.abs(currentDate.getTime() - deliveryDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  if (diffDays <= 7) {
                    return (
                      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Return Order
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Return or Replace Item</DialogTitle>
                            <DialogDescription>
                              Choose whether you want to return this item for a refund or get a replacement.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            {/* Request Type Selection */}
                            <div className="grid grid-cols-2 gap-4">
                              <div
                                className={cn(
                                  "border-2 rounded-xl p-4 cursor-pointer transition-all",
                                  requestType === 'return' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                )}
                                onClick={() => setRequestType('return')}
                              >
                                <div className="font-bold text-foreground mb-1">Return</div>
                                <p className="text-xs text-muted-foreground">Get a refund to your account</p>
                              </div>
                              <div
                                className={cn(
                                  "border-2 rounded-xl p-4 cursor-pointer transition-all",
                                  requestType === 'replace' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                )}
                                onClick={() => setRequestType('replace')}
                              >
                                <div className="font-bold text-foreground mb-1">Replace</div>
                                <p className="text-xs text-muted-foreground">Get a new item in exchange</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-sm font-medium">Reason for {requestType}</label>
                              {['Product defective/damaged', 'Received wrong item', 'Size/Fit issue', 'Quality not as expected'].map((r) => (
                                <div key={r} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id={`ret-${r}`}
                                    name="returnReason"
                                    value={r}
                                    checked={returnReason === r}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    className="text-primary focus:ring-primary"
                                  />
                                  <label htmlFor={`ret-${r}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {r}
                                  </label>
                                </div>
                              ))}
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="ret-Other"
                                  name="returnReason"
                                  value="Other"
                                  checked={returnReason === 'Other'}
                                  onChange={(e) => setReturnReason(e.target.value)}
                                />
                                <label htmlFor="ret-Other" className="text-sm font-medium leading-none">Other</label>
                              </div>
                              {returnReason === 'Other' && (
                                <textarea
                                  className="w-full border rounded-md p-2 text-sm mt-2"
                                  placeholder="Please specify reason..."
                                  value={otherReturnReason}
                                  onChange={e => setOtherReturnReason(e.target.value)}
                                />
                              )}
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsReturnDialogOpen(false)}>Cancel</Button>
                            <Button
                              onClick={async () => {
                                const finalReason = returnReason === 'Other' ? otherReturnReason : returnReason;
                                if (!finalReason) {
                                  toast.error("Please select a reason");
                                  return;
                                }

                                try {
                                  const token = localStorage.getItem('tmart_token');
                                  const res = await fetch(`${API_BASE_URL}/orders/${order.id}/return`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                      reason: finalReason,
                                      requestType
                                    })
                                  });
                                  const data = await res.json();
                                  if (res.ok) {
                                    toast.success(`${requestType === 'replace' ? 'Replacement' : 'Return'} requested successfully`);
                                    setOrder(prev => prev ? { ...prev, status: requestType === 'replace' ? 'Replacement Requested' : 'Return Requested' } : null);
                                    setIsReturnDialogOpen(false);
                                  } else {
                                    toast.error(data.message || 'Failed to submit request');
                                  }
                                } catch (error) {
                                  toast.error('Error submitting request');
                                }
                              }}
                              disabled={!returnReason || (returnReason === 'Other' && !otherReturnReason)}
                              className="bg-primary hover:bg-primary-dark text-white"
                            >
                              Confirm {requestType === 'replace' ? 'Replacement' : 'Return'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    );
                  }
                  return null;
                })()
              )}

              {/* Reorder - for delivered orders */}
              {order.status === 'Delivered' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE_URL}/orders/${order.id}`);
                      if (res.ok) {
                        const data = await res.json();
                        // Store in localStorage for reorder page
                        try {
                          localStorage.setItem('reorder_items', JSON.stringify(data.items));
                        } catch (error) {
                          console.warn('Failed to save reorder items:', error);
                        }
                        toast.success('Items ready for reorder! Check your cart.');
                        window.location.href = '/cart';
                      }
                    } catch (error) {
                      toast.error('Failed to reorder');
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reorder Items
                </Button>
              )}

              {/* Help */}
              <a href="tel:9137554336" className="block">
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Need Help? Call 9137554336
                </Button>
              </a>


            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderTracking;
