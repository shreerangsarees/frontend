import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Loader2, ShoppingBag, Clock, CheckCircle, History } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import api from '@/api/axios'; // Import the new axios instance

import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/dateUtils';
import { formatOrderId } from '@/lib/formatters';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: {
    product_name: string;
    product_image: string | null;
    quantity: number;
  }[];
  refundStatus?: 'not_initiated' | 'processing' | 'completed' | 'failed';
}

const statusColors: Record<string, string> = {
  'Placed': 'bg-golden/10 text-golden',
  'Pending': 'bg-golden/10 text-golden',
  'Processing': 'bg-teal/10 text-teal',
  'Shipped': 'bg-primary/10 text-primary',
  'Out for Delivery': 'bg-primary/10 text-primary',
  'Delivered': 'bg-success/10 text-success',
  'Cancelled': 'bg-destructive/10 text-destructive',
  'Return Requested': 'bg-orange-100 text-orange-700',
  'Replacement Requested': 'bg-blue-100 text-blue-700',
  'Returned': 'bg-gray-200 text-gray-700',
};

const statusLabels: Record<string, string> = {
  'Placed': 'Order Placed',
  'Pending': 'Pending',
  'Processing': 'Processing',
  'Shipped': 'Shipped',
  'Out for Delivery': 'Out for Delivery',
  'Delivered': 'Delivered',
  'Cancelled': 'Cancelled',
  'Return Requested': 'Return Requested',
  'Replacement Requested': 'Replacement Requested',
  'Returned': 'Returned',
};

type TabType = 'active' | 'past';

const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');

      const data = res.data;
      const mappedOrders = data.map((o: any) => ({
        id: o._id,
        status: o.status, // Keep original status from backend
        total_amount: o.totalAmount,
        created_at: o.createdAt,
        order_items: o.items.map((i: any) => ({
          product_name: i.name || i.product?.name || 'Unknown Product',
          product_image: i.image || i.product?.image || null,
          quantity: i.quantity
        })),
        refundStatus: o.refundStatus
      }));
      setOrders(mappedOrders);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  // Separate active and past orders and sort by date descending
  const activeOrders = orders
    .filter(o => !['Delivered', 'Cancelled'].includes(o.status))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const pastOrders = orders
    .filter(o => ['Delivered', 'Cancelled'].includes(o.status))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container-app py-6 sm:py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 sm:p-6">
                <div className="flex justify-between mb-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const OrderCard = ({ order, index }: { order: Order; index: number }) => (
    <Link
      key={order.id}
      to={`/order/${order.id}`}
      className={cn(
        "block bg-card rounded-2xl border border-border p-4 sm:p-6 hover:border-primary transition-colors",
        "opacity-0 animate-slide-up"
      )}
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">
              Order #{formatOrderId(order.id)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(order.created_at, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            "text-xs font-medium px-3 py-1 rounded-full",
            statusColors[order.status] || 'bg-muted text-muted-foreground'
          )}>
            {statusLabels[order.status] || order.status}
          </span>
          {order.status === 'Cancelled' && order.refundStatus && order.refundStatus !== 'not_initiated' && (
            <span className={cn(
              "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
              order.refundStatus === 'completed'
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            )}>
              Refund: {order.refundStatus}
            </span>
          )}
        </div>
      </div>

      {/* Order items preview */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex -space-x-2">
          {order.order_items.slice(0, 3).map((item, i) => (
            <div
              key={i}
              className="h-12 w-12 rounded-lg border-2 border-card overflow-hidden bg-muted"
            >
              {item.product_image && (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
          {order.order_items.length > 3 && (
            <div className="h-12 w-12 rounded-lg border-2 border-card bg-muted flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                +{order.order_items.length - 3}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground line-clamp-1">
            {order.order_items.map(i => i.product_name).join(', ')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="font-bold text-foreground">
          ₹{order.total_amount}
        </span>
        <span className="text-primary font-medium flex items-center gap-1">
          View Details
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link >
  );

  return (
    <Layout>
      <div className="container-app py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-6">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              No orders yet
            </h2>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping!
            </p>
            <Link to="/products">
              <Button variant="hero" size="lg">
                Start Shopping
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-muted/50 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('active')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                  activeTab === 'active'
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className="h-4 w-4" />
                Active Orders
                {activeOrders.length > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                    {activeOrders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                  activeTab === 'past'
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <History className="h-4 w-4" />
                Past Orders
                {pastOrders.length > 0 && (
                  <span className="bg-muted-foreground/20 text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                    {pastOrders.length}
                  </span>
                )}
              </button>
            </div>

            {/* Orders List */}
            {displayedOrders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                {activeTab === 'active' ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No active orders</h3>
                    <p className="text-muted-foreground mb-4">
                      All your orders have been delivered!
                    </p>
                    <Link to="/products">
                      <Button variant="outline">
                        Continue Shopping
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No past orders</h3>
                    <p className="text-muted-foreground">
                      Your completed orders will appear here.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {displayedOrders.map((order, index) => (
                  <OrderCard key={order.id} order={order} index={index} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyOrders;

