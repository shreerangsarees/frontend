import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from './AdminLayout';
import { Loader2, TrendingUp, Package, ShoppingCart, IndianRupee } from 'lucide-react';

interface DashboardStats {
  totalSales: number;
  activeOrders: number;
  totalProducts: number;
  todayOrders: number;
  recentOrders: any[];
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    activeOrders: 0,
    totalProducts: 0,
    todayOrders: 0,
    recentOrders: []
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch orders
      const ordersRes = await fetch('/api/orders');
      const orders = ordersRes.ok ? await ordersRes.json() : [];

      // Fetch products
      const productsRes = await fetch('/api/products');
      const products = productsRes.ok ? await productsRes.json() : [];

      // Calculate stats
      const totalSales = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      const activeOrders = orders.filter((o: any) =>
        !['Delivered', 'Cancelled'].includes(o.status)
      ).length;

      // Today's orders
      const today = new Date().toDateString();
      const todayOrders = orders.filter((o: any) =>
        new Date(o.createdAt).toDateString() === today
      ).length;

      setStats({
        totalSales,
        activeOrders,
        totalProducts: products.length,
        todayOrders,
        recentOrders: orders.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-coral" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Sales</h3>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">₹{stats.totalSales.toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted-foreground mt-1">From all orders</p>
        </div>

        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Orders</h3>
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.activeOrders}</p>
          <p className="text-xs text-muted-foreground mt-1">Pending fulfillment</p>
        </div>

        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Products</h3>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.totalProducts}</p>
          <p className="text-xs text-muted-foreground mt-1">In catalog</p>
        </div>

        <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Today's Orders</h3>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.todayOrders}</p>
          <p className="text-xs text-muted-foreground mt-1">Orders today</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {stats.recentOrders.map((order: any) => (
              <div key={order._id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                    {order.user?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium">{order.user?.name || 'Guest'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{order.totalAmount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
