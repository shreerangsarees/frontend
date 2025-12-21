import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

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
}

const statusColors: Record<string, string> = {
  'Placed': 'bg-golden/10 text-golden',
  'Pending': 'bg-golden/10 text-golden',
  'Processing': 'bg-teal/10 text-teal',
  'Shipped': 'bg-primary/10 text-primary',
  'Out for Delivery': 'bg-coral/10 text-coral',
  'Delivered': 'bg-success/10 text-success',
  'Cancelled': 'bg-destructive/10 text-destructive',
};

const statusLabels: Record<string, string> = {
  'Placed': 'Order Placed',
  'Pending': 'Pending',
  'Processing': 'Processing',
  'Shipped': 'Shipped',
  'Out for Delivery': 'Out for Delivery',
  'Delivered': 'Delivered',
  'Cancelled': 'Cancelled',
};

const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      const res = await fetch('/api/orders/my-orders');
      if (res.ok) {
        const data = await res.json();
        const mappedOrders = data.map((o: any) => ({
          id: o._id,
          status: o.status, // Keep original status from backend
          total_amount: o.totalAmount,
          created_at: o.createdAt,
          order_items: o.items.map((i: any) => ({
            product_name: i.product?.name || 'Unknown Product',
            product_image: i.product?.image || null,
            quantity: i.quantity
          }))
        }));
        setOrders(mappedOrders);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
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
          <div className="space-y-4">
            {orders.map((order, index) => (
              <Link
                key={order.id}
                to={`/order/${order.id}`}
                className={cn(
                  "block bg-card rounded-2xl border border-border p-4 sm:p-6 hover:border-coral transition-colors",
                  "opacity-0 animate-slide-up"
                )}
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-coral" />
                      <span className="font-medium text-foreground">
                        Order #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-3 py-1 rounded-full",
                    statusColors[order.status] || 'bg-muted text-muted-foreground'
                  )}>
                    {statusLabels[order.status] || order.status}
                  </span>
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
                  <span className="text-coral font-medium flex items-center gap-1">
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyOrders;
