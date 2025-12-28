import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { Loader2, DollarSign, Users, ShoppingBag, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Package, Download, Activity } from 'lucide-react';
import { API_BASE_URL } from '@/apiConfig';
import { toast } from 'sonner';

// Colors for Charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('tmart_token');
      const res = await fetch(`${API_BASE_URL}/analytics/overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type: 'sales' | 'stock') => {
    try {
      toast.loading('Generating report...');
      const token = localStorage.getItem('tmart_token');
      const res = await fetch(`${API_BASE_URL}/analytics/report/${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to download');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shreerang-${type}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.dismiss();
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error('Failed to download report');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const { cards, charts, lists } = data;

  return (
    <AdminLayout>
      <div className="container-app py-8 space-y-8 bg-muted/5 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive overview of store performance.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadReport('sales')}>
              <Download className="mr-2 h-4 w-4" /> Sales Report
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadReport('stock')}>
              <Download className="mr-2 h-4 w-4" /> Stock Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={`₹${cards.totalRevenue.toLocaleString()}`}
            subValue={`${cards.growth}% vs last month`}
            icon={<DollarSign className="h-4 w-4" />}
            trend={parseFloat(cards.growth) > 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Active Orders"
            value={data.orders?.pending || 0} // Assuming 'pending' as active proxy or calculating from charts
            subValue="Processing / Shipped"
            icon={<ShoppingBag className="h-4 w-4" />}
          />
          <MetricCard
            title="Total Users"
            value={cards.totalUsers}
            subValue="Registered Customers"
            icon={<Users className="h-4 w-4" />}
          />
          <MetricCard
            title="Today's Revenue"
            value={`₹${cards.todayRevenue.toLocaleString()}`}
            subValue="Sales today"
            icon={<Activity className="h-4 w-4" />}
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Revenue Trend (Area Chart) */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Trend (12 Months)</CardTitle>
              <CardDescription>Monthly revenue performance history</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales by Category (Pie Chart) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Distribution of units sold</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charts.salesByCategory.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Status Distribution (Bar Chart) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Current state of all orders</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.orderStatusData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20}>
                    {charts.orderStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Sales Trend (Line Chart) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Last 30 Days Sales</CardTitle>
              <CardDescription>Daily revenue fluctuation</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(str) => new Date(str).getDate().toString()} tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip
                    labelFormatter={(label) => new Date(label).toDateString()}
                    formatter={(value: number) => [`₹${value}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#ff7300" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly History Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Monthly History
            </CardTitle>
            <CardDescription>Detailed breakdown of performance by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Month</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3">Cancelled</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Avg Order Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...charts.monthlyData].reverse().map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{row.month}</td>
                      <td className="px-4 py-3">{row.orders}</td>
                      <td className="px-4 py-3 text-red-500">{row.cancelled}</td>
                      <td className="px-4 py-3 text-right font-bold">₹{row.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        ₹{row.orders > 0 ? Math.round(row.revenue / row.orders).toLocaleString() : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

// Simple reusable metric card
const MetricCard = ({ title, value, subValue, icon, trend }: any) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'} flex items-center mt-1`}>
        {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : null}
        {subValue}
      </p>
    </CardContent>
  </Card>
);

export default AdminAnalytics;
