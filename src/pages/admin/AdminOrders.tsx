import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Clock, Package, Truck, X, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    image?: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  items?: OrderItem[];
  user?: any;
  shippingAddress?: {
    label: string;
    full_address: string;
    city: string;
    pincode: string;
  };
}

const AdminOrders: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.map((o: any) => ({
          id: o._id,
          total_amount: o.totalAmount,
          status: o.status,
          created_at: o.createdAt,
          payment_method: o.paymentMethod,
          items: o.items,
          user: o.user,
          shippingAddress: o.shippingAddress
        })));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success('Order status updated');
        fetchOrders();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (authLoading) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Orders</h1>
          <p className="text-muted-foreground">{orders.length} orders</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-3"></th>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders found</td></tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr
                      className={cn(
                        "hover:bg-muted/30 cursor-pointer transition-colors",
                        expandedOrderId === order.id && "bg-muted/20"
                      )}
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      <td className="px-4 py-4">
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                          {expandedOrderId === order.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                      <td className="px-6 py-4 font-medium">#{order.id.slice(-6)}</td>
                      <td className="px-6 py-4">
                        {order.user?.name || 'Unknown'} <br />
                        <span className="text-xs text-muted-foreground">{order.user?.email}</span>
                      </td>
                      <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold">₹{order.total_amount}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium",
                          order.status === 'Delivered' ? "bg-green-100 text-green-700" :
                            order.status === 'Cancelled' ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <select
                          className="border rounded px-2 py-1 text-xs"
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>

                    {/* Expanded Order Details Row */}
                    {expandedOrderId === order.id && (
                      <tr className="bg-muted/10">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Order Items */}
                            <div>
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" />
                                Order Items ({order.items?.length || 0} items)
                              </h4>
                              <div className="space-y-3">
                                {order.items && order.items.length > 0 ? (
                                  order.items.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                                    >
                                      {item.product?.image ? (
                                        <img
                                          src={item.product.image}
                                          alt={item.product?.name || 'Product'}
                                          className="w-12 h-12 object-cover rounded-md"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                          <Package className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <p className="font-medium text-sm">
                                          {item.product?.name || 'Unknown Product'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Qty: {item.quantity} × ₹{item.price}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-sm">
                                          ₹{item.quantity * item.price}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-muted-foreground text-sm">No items found</p>
                                )}
                              </div>
                            </div>

                            {/* Shipping & Payment Info */}
                            <div className="space-y-4">
                              {/* Shipping Address */}
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Shipping Address</h4>
                                {order.shippingAddress ? (
                                  <div className="p-3 bg-background rounded-lg border text-sm">
                                    <p className="font-medium">{order.shippingAddress.label}</p>
                                    <p className="text-muted-foreground">{order.shippingAddress.full_address}</p>
                                    <p className="text-muted-foreground">
                                      {order.shippingAddress.city} - {order.shippingAddress.pincode}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground text-sm">No address available</p>
                                )}
                              </div>

                              {/* Payment Info */}
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Payment Details</h4>
                                <div className="p-3 bg-background rounded-lg border text-sm">
                                  <p><span className="text-muted-foreground">Method:</span> <span className="font-medium capitalize">{order.payment_method}</span></p>
                                  <p><span className="text-muted-foreground">Total:</span> <span className="font-bold">₹{order.total_amount}</span></p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
