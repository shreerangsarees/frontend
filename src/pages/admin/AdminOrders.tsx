import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Clock, Package, Truck, X, ChevronDown, ChevronUp, ShoppingBag, FileText, Download, RefreshCcw, AlertTriangle } from 'lucide-react';
import { formatOrderId } from '@/lib/formatters';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/dateUtils';
import api from '@/api/axios'; // Import the new axios instance
import { useSocket } from '@/context/SocketContext';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    image?: string;
    price: number;
    // Add missing properties to avoid TS errors
    stock?: number;
    description?: string;
  };
  quantity: number;
  price: number;
  name?: string;
  image?: string;
  selectedColor?: string;
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
  refundStatus?: 'not_initiated' | 'processing' | 'completed' | 'failed';
  transaction_id?: string;
  returnReason?: string;
}

type TabType = 'all' | 'active' | 'completed' | 'cancelled' | 'returns';

const AdminOrders: React.FC = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { socket } = useSocket(); // Use socket
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useEffect(() => {
    if (user && isAdmin) {
      fetchOrders();
    }
  }, [user, isAdmin]);

  // Listen for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on('newOrder', (newOrder: any) => {
        toast.info('New order received!');
        fetchOrders();
      });

      socket.on('orderStatusUpdated', (data: { orderId: string; status: string }) => {
        setOrders(prev => prev.map(o =>
          o.id === data.orderId ? { ...o, status: data.status } : o
        ));
        toast.success(`Order #${data.orderId.slice(-6)} updated to ${data.status}`);
      });

      return () => {
        socket.off('newOrder');
        socket.off('orderStatusUpdated');
      };
    }
  }, [socket]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      const data = res.data;
      setOrders(data.map((o: any) => ({
        id: o._id,
        total_amount: o.totalAmount,
        status: o.status,
        created_at: o.createdAt,
        payment_method: o.paymentMethod,
        items: o.items.map((i: any) => ({
          ...i,
          selectedColor: i.selectedColor
        })),
        user: o.user,
        shippingAddress: o.shippingAddress,
        refundStatus: o.refundStatus,
        transaction_id: o.paymentInfo?.razorpay_payment_id,
        returnReason: o.returnReason
      })));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const handleRefundUpdate = async (orderId: string, refundStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/refund`, { refundStatus });
      toast.success(`Refund status updated to ${refundStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, refundStatus: refundStatus as any } : o));
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update refund status');
    }
  };

  const handleReturnAction = async (orderId: string, action: 'approve' | 'reject') => {
    try {
      let body: any = { action };

      if (action === 'reject') {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return; // Cancelled
        body.rejectionReason = reason;
      }

      // Determine new status based on current status and action
      const currentOrder = orders.find(o => o.id === orderId);
      let newStatus = 'Delivered'; // Default for reject

      if (action === 'approve') {
        if (currentOrder?.status === 'Replacement Requested') {
          newStatus = 'Processing'; // Approved replacement -> Prepare to ship
        } else {
          newStatus = 'Returned'; // Approved return -> Refund
        }
      }

      const res = await api.put(`/orders/${orderId}/return/process`, body);
      toast.success(res.data.message);

      // Update local state
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: action === 'approve' ? newStatus : 'Delivered'
          };
        }
        return o;
      }));

    } catch (error: any) {
      console.error('Error processing return:', error);
      toast.error(error.response?.data?.message || 'Failed to process return');
    }
  };


  const handleViewInvoice = async (orderId: string) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write('Generate invoice...');
      newWindow.document.title = "Invoice";
    }

    try {
      const response = await api.get(`/invoices/${orderId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      if (newWindow) {
        newWindow.location.href = url;
      }
    } catch (error) {
      console.error("Error fetching invoice", error);
      toast.error("Failed to fetch invoice");
      if (newWindow) newWindow.close();
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return ['Pending', 'Processing', 'Shipped', 'Out for Delivery'].includes(order.status);
    }
    if (activeTab === 'completed') {
      return order.status === 'Delivered';
    }
    if (activeTab === 'cancelled') {
      return ['Cancelled', 'Returned'].includes(order.status);
    }
    if (activeTab === 'returns') {
      return ['Return Requested', 'Replacement Requested'].includes(order.status);
    }
    return true;
  });


  if (authLoading) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Orders</h1>
          <p className="text-muted-foreground">{filteredOrders.length} orders found</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-muted/50 p-1 rounded-lg overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === 'all' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === 'active' ? "bg-blue-50 text-blue-700 shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === 'completed' ? "bg-green-50 text-green-700 shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === 'cancelled' ? "bg-red-50 text-red-700 shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Cancelled / Refunds
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              activeTab === 'returns' ? "bg-orange-50 text-orange-700 shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Return Requests
            {orders.filter(o => ['Return Requested', 'Replacement Requested'].includes(o.status)).length > 0 && (
              <span className="ml-2 bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {orders.filter(o => ['Return Requested', 'Replacement Requested'].includes(o.status)).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
            No {activeTab !== 'all' ? activeTab : ''} orders found
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground font-medium">
                    <tr>
                      <th className="px-6 py-3"></th>
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Payment</th>
                      <th className="px-6 py-3">Status</th>
                      {activeTab === 'cancelled' && <th className="px-6 py-3">Refund Status</th>}
                      {activeTab === 'returns' && <th className="px-6 py-3">Return Reason</th>}
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        <tr
                          className={cn(
                            "hover:bg-muted/30 cursor-pointer transition-colors",
                            expandedOrderId === order.id && "bg-muted/20",
                            order.status === 'Cancelled' && "bg-red-50/30"
                          )}
                          onClick={() => toggleOrderDetails(order.id)}
                        >
                          <td className="px-4 py-4">
                            <Button variant="ghost" size="sm" className="p-1 h-auto">
                              {expandedOrderId === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </td>
                          <td className="px-6 py-4 font-medium">#{formatOrderId(order.id)}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{order.user?.name || 'Guest'}</span>
                              <span className="text-xs text-muted-foreground">{order.user?.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{formatDate(order.created_at)}</td>
                          <td className="px-6 py-4 font-bold">₹{order.total_amount}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="capitalize font-medium">{order.payment_method === 'cod' ? 'COD' : order.payment_method}</span>
                              {order.transaction_id && (
                                <span className="text-[10px] text-muted-foreground font-mono" title="Transaction ID">
                                  {order.transaction_id}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
                              order.status === 'Delivered' ? "bg-green-100 text-green-700" :
                                order.status === 'Cancelled' ? "bg-red-100 text-red-700" :
                                  order.status === 'Returned' ? "bg-purple-100 text-purple-700" :
                                    "bg-yellow-100 text-yellow-700"
                            )}>
                              {order.status}
                            </span>
                          </td>
                          {activeTab === 'cancelled' && (
                            <td className="px-6 py-4">
                              {order.payment_method !== 'cod' ? (
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                  order.refundStatus === 'completed' ? "bg-green-50 text-green-700 border-green-200" :
                                    order.refundStatus === 'processing' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                      order.refundStatus === 'failed' ? "bg-red-50 text-red-700 border-red-200" :
                                        "bg-gray-100 text-gray-600 border-gray-200"
                                )}>
                                  {order.refundStatus || 'Pending'}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">COD (No Refund)</span>
                              )}
                            </td>
                          )}
                          {activeTab === 'returns' && (
                            <td className="px-6 py-4">
                              <span className="text-sm text-foreground">{order.returnReason || 'N/A'}</span>
                            </td>
                          )}
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              {/* Only show Status Dropdown for Standard Active states */}
                              {!['Delivered', 'Cancelled', 'Returned', 'Return Requested', 'Replacement Requested'].includes(order.status) && (
                                <select
                                  className="border rounded px-2 py-1 text-xs bg-background max-w-[120px]"
                                  value={order.status}
                                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              )}

                              {/* Show specific action button for Return/Replacement Requests */}
                              {['Return Requested', 'Replacement Requested'].includes(order.status) && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className={cn(
                                    "h-7 text-xs px-2",
                                    order.status === 'Replacement Requested' ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"
                                  )}
                                  onClick={(e) => { e.stopPropagation(); toggleOrderDetails(order.id); }}
                                >
                                  Review Request
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                title="View Invoice"
                                onClick={(e) => { e.stopPropagation(); handleViewInvoice(order.id); }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Order Details Row */}
                        {expandedOrderId === order.id && (
                          <tr className="bg-muted/10">
                            <td colSpan={activeTab === 'cancelled' ? 9 : 8} className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Order Items */}
                                <div>
                                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    Order Items ({order.items?.length || 0})
                                  </h4>
                                  <div className="space-y-3">
                                    {order.items?.map((item, index) => (
                                      <div key={index} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                                        {item.image || item.product?.image ? (
                                          <img src={item.image || item.product.image} className="h-12 w-12 object-cover rounded" />
                                        ) : (
                                          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center"><Package className="h-6 w-6 opacity-50" /></div>
                                        )}
                                        <div className="flex-1">
                                          <p className="font-semibold text-base text-foreground">{item.name || item.product?.name || 'Unknown Product'}</p>
                                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                            <p className="text-sm text-muted-foreground">
                                              Qty: <span className="font-medium text-foreground">{item.quantity}</span> × ₹{item.price}
                                            </p>
                                            {item.selectedColor && (
                                              <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded border border-border">
                                                <span className="text-xs text-muted-foreground font-medium uppercase">Color:</span>
                                                {item.selectedColor.startsWith('#') ? (
                                                  <div className="flex items-center gap-1">
                                                    <span className="block h-3 w-3 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: item.selectedColor }} />
                                                    <span className="text-sm font-bold text-foreground">{item.selectedColor}</span>
                                                  </div>
                                                ) : (
                                                  <span className="text-sm font-bold text-primary">{item.selectedColor}</span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <p className="font-semibold">₹{item.quantity * item.price}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Shipping & Payment & REFUND Section */}
                                <div className="space-y-4">
                                  {/* Address */}
                                  <div className="p-3 bg-background border rounded-lg">
                                    <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2 flex items-center gap-2">
                                      <Truck className="h-3 w-3" /> Shipping Address
                                    </h4>
                                    {order.shippingAddress && (
                                      <div className="text-sm">
                                        <p className="font-medium">{order.shippingAddress.label}</p>
                                        <p>{order.shippingAddress.full_address}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.pincode}</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Return/Replacement Request Management */}
                                  {(order.status === 'Return Requested' || order.status === 'Replacement Requested') && (
                                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                      <h4 className="font-bold text-sm text-orange-800 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> {order.status}
                                      </h4>
                                      <div className="mb-4">
                                        <p className="text-sm font-medium text-orange-900">Reason:</p>
                                        <p className="text-sm text-orange-800 bg-white/50 p-2 rounded border border-orange-100 mt-1">
                                          {order.returnReason}
                                        </p>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                                          onClick={() => {
                                            const msg = order.status === 'Replacement Requested'
                                              ? "Approve replacement? Status will change to Processing for shipping."
                                              : "Approve return? Stock will be restored and you can process refund.";
                                            if (confirm(msg)) handleReturnAction(order.id, 'approve');
                                          }}
                                        >
                                          Approve {order.status === 'Replacement Requested' ? 'Replacement' : 'Return'}
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          className="flex-1"
                                          onClick={() => handleReturnAction(order.id, 'reject')}
                                        >
                                          Reject Return
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Refund Manager (Only for Cancelled/Returned & Non-COD) */}
                                  {(order.status === 'Cancelled' || order.status === 'Returned') && order.payment_method !== 'cod' && (
                                    <div className="p-4 bg-white border-2 border-dashed border-red-200 rounded-xl shadow-sm">
                                      <h4 className="font-bold text-sm text-red-700 mb-3 flex items-center gap-2">
                                        <RefreshCcw className="h-4 w-4" /> Refund Management
                                      </h4>

                                      <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm text-gray-600">Current Status:</p>
                                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase",
                                          order.refundStatus === 'completed' ? "bg-green-100 text-green-800" :
                                            order.refundStatus === 'processing' ? "bg-blue-100 text-blue-800" :
                                              order.refundStatus === 'failed' ? "bg-red-100 text-red-800" :
                                                "bg-gray-100 text-gray-600"
                                        )}>
                                          {order.refundStatus || 'Not Initiated'}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        {(!order.refundStatus || order.refundStatus === 'not_initiated') && (
                                          <Button
                                            size="sm"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => {
                                              if (confirm("Initiate Refund for this order?")) handleRefundUpdate(order.id, 'processing')
                                            }}
                                          >
                                            Initiate Refund
                                          </Button>
                                        )}

                                        {order.refundStatus === 'processing' && (
                                          <>
                                            <Button
                                              size="sm"
                                              className="bg-green-600 hover:bg-green-700 text-white"
                                              onClick={() => {
                                                if (confirm("Confirm refund completed?")) handleRefundUpdate(order.id, 'completed')
                                              }}
                                            >
                                              Mark Completed
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="destructive"
                                              onClick={() => {
                                                if (confirm("Mark refund as failed?")) handleRefundUpdate(order.id, 'failed')
                                              }}
                                            >
                                              Mark Failed
                                            </Button>
                                          </>
                                        )}

                                        {order.refundStatus === 'failed' && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRefundUpdate(order.id, 'processing')}
                                          >
                                            Retry (Set to Processing)
                                          </Button>
                                        )}
                                      </div>

                                      {order.refundStatus === 'completed' && (
                                        <div className="text-center p-2 bg-green-50 rounded text-xs text-green-700 flex items-center justify-center gap-1">
                                          <CheckCircle className="h-3 w-3" /> Refund Successfully Processed
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* COD Warning */}
                                  {(order.status === 'Cancelled' || order.status === 'Returned') && order.payment_method === 'cod' && (
                                    <div className="p-3 bg-gray-100 rounded-lg text-xs text-gray-500 flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4" />
                                      Order was Cash on Delivery. No automatic refund tracking needed usually.
                                    </div>
                                  )}

                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">#{formatOrderId(order.id)}</span>
                        <span className="text-xs text-muted-foreground">({formatDate(order.created_at)})</span>
                      </div>
                      <p className="text-sm font-medium">{order.user?.name || 'Guest'}</p>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      order.status === 'Delivered' ? "bg-green-100 text-green-700" :
                        order.status === 'Cancelled' ? "bg-red-100 text-red-700" :
                          order.status === 'Returned' ? "bg-purple-100 text-purple-700" :
                            "bg-yellow-100 text-yellow-700"
                    )}>
                      {order.status}
                    </span>
                  </div>

                  {/* Key Stats */}
                  <div className="flex justify-between items-end mb-4 border-b pb-4 border-dashed">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Payment</p>
                      <p className="text-sm font-medium capitalize flex items-center gap-1">
                        {order.payment_method}
                        {order.payment_method !== 'cod' && <CheckCircle className="h-3 w-3 text-green-500" />}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="text-lg font-bold">₹{order.total_amount}</p>
                    </div>
                  </div>

                  {/* Actions / Info Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                    <span>{order.items?.length} Item(s) & Details</span>
                    {expandedOrderId === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>

                  {/* Expanded Content */}
                  {expandedOrderId === order.id && (
                    <div className="mt-4 space-y-5 animate-in slide-in-from-top-2 duration-200">

                      {/* Status Control (Only for Active Orders) */}
                      {!['Delivered', 'Cancelled', 'Returned', 'Return Requested', 'Replacement Requested'].includes(order.status) && (
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Update Status</label>
                          <select
                            className="w-full border rounded px-3 py-2 text-sm bg-background"
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
                        </div>
                      )}

                      {/* Items List */}
                      <div>
                        <h4 className="font-bold text-xs uppercase text-muted-foreground mb-3 flex items-center gap-2">
                          <ShoppingBag className="h-3 w-3" /> Order Items
                        </h4>
                        <div className="space-y-3">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex gap-3 bg-muted/10 p-2 rounded-lg">
                              {item.image || item.product?.image ? (
                                <img src={item.image || item.product.image} className="h-12 w-12 object-cover rounded bg-white" />
                              ) : (
                                <div className="h-12 w-12 bg-muted rounded flex items-center justify-center shrink-0"><Package className="h-5 w-5 opacity-30" /></div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.name || item.product?.name}</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">Qty: <b className="text-foreground">{item.quantity}</b></span>
                                  {item.selectedColor && (
                                    <span className="text-xs border px-1.5 rounded flex items-center gap-1">
                                      {item.selectedColor.startsWith('#') && <span className="h-2 w-2 rounded-full block" style={{ background: item.selectedColor }} />}
                                      {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2 flex items-center gap-2">
                          <Truck className="h-3 w-3" /> Shipping Address
                        </h4>
                        <div className="text-sm">
                          <p className="font-medium">{order.shippingAddress?.label}</p>
                          <p className="text-muted-foreground">{order.shippingAddress?.full_address}</p>
                          <p className="text-muted-foreground">{order.shippingAddress?.city} - {order.shippingAddress?.pincode}</p>
                        </div>
                      </div>

                      {/* Return/Replacement Requests */}
                      {(order.status === 'Return Requested' || order.status === 'Replacement Requested') && (
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                          <h4 className="font-bold text-sm text-orange-800 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" /> Action Required
                          </h4>
                          <p className="text-xs text-orange-700 mb-1">Reason: <b>{order.returnReason}</b></p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9 text-xs"
                              onClick={() => {
                                const msg = order.status === 'Replacement Requested'
                                  ? "Approve replacement?"
                                  : "Approve return?";
                                if (confirm(msg)) handleReturnAction(order.id, 'approve');
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1 h-9 text-xs"
                              onClick={() => handleReturnAction(order.id, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Refund Management */}
                      {(order.status === 'Cancelled' || order.status === 'Returned') && order.payment_method !== 'cod' && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-xs text-red-800 uppercase">Refund Status</h4>
                            <span className="text-[10px] font-bold bg-white/50 px-2 py-0.5 rounded uppercase border border-red-100">
                              {order.refundStatus || 'Pending'}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {(!order.refundStatus || order.refundStatus === 'not_initiated') && (
                              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleRefundUpdate(order.id, 'processing')}>
                                Initiate Refund
                              </Button>
                            )}
                            {order.refundStatus === 'processing' && (
                              <div className="flex gap-2">
                                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleRefundUpdate(order.id, 'completed')}>Complete</Button>
                                <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleRefundUpdate(order.id, 'failed')}>Fail</Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* View Invoice */}
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewInvoice(order.id)}>
                        <FileText className="h-4 w-4 mr-2" /> Download Invoice
                      </Button>

                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
