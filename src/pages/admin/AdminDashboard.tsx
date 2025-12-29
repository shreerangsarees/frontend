import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Loader2, TrendingUp, Package, ShoppingCart, IndianRupee, AlertTriangle, ArrowRight, Truck, RotateCcw, Plus } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { formatDate } from '@/lib/dateUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/apiConfig';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalSales: number;
  activeOrders: number;
  totalProducts: number;
  todayOrders: number;
  revenueGrowth: string;
  todayRevenue: number;
  lowStockCount: number;
  pendingReturns: number;
  pendingShipments: number;
  outOfStockCount: number;
  recentOrders: any[];
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    activeOrders: 0,
    totalProducts: 0,
    todayOrders: 0,
    revenueGrowth: '0',
    todayRevenue: 0,
    lowStockCount: 0,
    pendingReturns: 0,
    pendingShipments: 0,
    outOfStockCount: 0,
    recentOrders: []
  });

  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
    if (socket) {
      socket.on('newOrder', fetchDashboardStats);
      return () => { socket.off('newOrder'); };
    }
  }, [socket]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('tmart_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const statsRes = await fetch(`${API_BASE_URL}/analytics/dashboard`, { headers });
      const data = statsRes.ok ? await statsRes.json() : {};

      setStats({
        totalSales: data.totalRevenue || 0,
        activeOrders: data.activeOrders || 0,
        totalProducts: data.totalProducts || 0,
        todayOrders: data.todayOrders || 0,
        revenueGrowth: data.revenueGrowth || '0',
        todayRevenue: data.todayRevenue || 0,
        lowStockCount: data.lowStockCount || 0,
        pendingReturns: data.pendingReturns || 0,
        pendingShipments: data.pendingShipments || 0,
        outOfStockCount: data.outOfStockCount || 0,
        recentOrders: data.recentOrders || []
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-app py-8 space-y-8 bg-muted/5 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Admin Command Center</h1>
            <p className="text-muted-foreground">Real-time overview and quick actions.</p>
          </div>
          <div className="w-full md:w-auto grid grid-cols-2 gap-2">
            <Button onClick={() => navigate('/admin/products?action=add')} className="bg-primary hover:bg-primary/90 w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/coupons')} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Create Coupon
            </Button>
          </div>
        </div>

        {/* Action Center - Immediate Attention */}
        {/* Action Center - Immediate Attention */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            title="Out of Stock"
            value={stats.outOfStockCount}
            label="Restock immediately"
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            color="red"
            onClick={() => navigate('/admin/products?filter=outOfStock')}
          />
          <ActionCard
            title="Low Stock"
            value={stats.lowStockCount}
            label="Running low (< 5)"
            icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
            color="orange"
            onClick={() => navigate('/admin/products?filter=lowStock')}
          />
          <ActionCard
            title="Pending Returns"
            value={stats.pendingReturns}
            label="Requests to handle"
            icon={<RotateCcw className="h-5 w-5 text-blue-600" />}
            color="blue"
            onClick={() => navigate('/admin/orders?status=return')}
          />
          <ActionCard
            title="Ready to Ship"
            value={stats.pendingShipments}
            label="Orders to process"
            icon={<Truck className="h-5 w-5 text-purple-600" />}
            color="purple"
            onClick={() => navigate('/admin/orders?status=processing')}
          />
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalSales.toLocaleString()}`}
            trend={`${stats.revenueGrowth}% vs last month`}
            trendIcon={<TrendingUp className="h-3 w-3" />}
            trendUp={parseFloat(stats.revenueGrowth) > 0}
            icon={<IndianRupee className="h-4 w-4 text-green-600" />}
          />
          <StatCard
            title="Today's Revenue"
            value={`₹${stats.todayRevenue.toLocaleString()}`}
            trend="Live"
            icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
          />
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            trend="In progress"
            icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            trend="In catalog"
            icon={<Package className="h-4 w-4 text-gray-600" />}
          />
        </div>

        {/* Recent Activity */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer purchases.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent orders.</p>
              ) : (
                stats.recentOrders.map((order: any) => (
                  <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer gap-4" onClick={() => navigate('/admin/orders', { state: { orderId: order._id } })}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary shrink-0">
                        {order.user?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{order.user?.name || 'Guest'}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      <p className="font-bold">₹{order.totalAmount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

// Reusable Components
const ActionCard = ({ title, value, label, icon, color, onClick }: any) => (
  <Card className={`border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow`} style={{ borderLeftColor: color }} onClick={onClick}>
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </div>
      <div className={`h-10 w-10 rounded-full bg-${color}-50 flex items-center justify-center`}>
        {icon}
      </div>
    </CardContent>
  </Card>
);

const StatCard = ({ title, value, trend, trendIcon, trendUp, icon }: any) => (
  <Card className="shadow-sm">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 bg-muted rounded-full">{icon}</div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className={`text-xs flex items-center ${trendUp ? 'text-green-600' : 'text-muted-foreground'}`}>
        {trendIcon && <span className="mr-1">{trendIcon}</span>}
        {trend}
      </div>
    </CardContent>
  </Card>
);

export default AdminDashboard;
