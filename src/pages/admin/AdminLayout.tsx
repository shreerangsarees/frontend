import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, LogOut, Menu, X, TicketPercent, ShoppingBag, Users, Tag, Layers, Image, MessageSquare, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: Layers, label: 'Categories', path: '/admin/categories' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Star, label: 'Reviews', path: '/admin/reviews' },
  { icon: TicketPercent, label: 'Coupons', path: '/admin/coupons' },
  { icon: Tag, label: 'Offers', path: '/admin/offers' },
  { icon: Image, label: 'Banners', path: '/admin/banners' },
  { icon: Layers, label: 'Blogs', path: '/admin/blogs' },
  { icon: MessageSquare, label: 'Testimonials', path: '/admin/testimonials' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, loading } = useAuth();
  const { socket } = useSocket();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        navigate('/');
        toast.error('Unauthorized Access');
      }
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    setSidebarOpen(false);
    await signOut();
    navigate('/auth');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || user.role !== 'admin') return null;

  // Close sidebar on navigation (for mobile)
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Global Admin Listeners
  React.useEffect(() => {
    if (socket) {
      socket.emit('joinAdminRoom'); // Ensure we are in the admin room

      const handleNewOrder = (data: any) => {
        toast.info(`New Order! ₹${data.totalAmount}`, {
          description: `Order #${data.orderId.slice(-6).toUpperCase()} received.`,
          action: {
            label: 'View',
            onClick: () => navigate('/admin/orders')
          }
        });
      };

      const handleReturn = (data: any) => {
        toast.warning('Return Requested', {
          description: `Order #${data.orderId.slice(-6).toUpperCase()}`
        });
      };

      socket.on('newOrder', handleNewOrder);
      socket.on('returnRequested', handleReturn);

      return () => {
        socket.off('newOrder', handleNewOrder);
        socket.off('returnRequested', handleReturn);
      };
    }
  }, [socket, navigate]);

  // Prevent body scroll when mobile sidebar is open
  React.useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header - fixed at top */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-muted active:bg-muted/70 transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Shreerang" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-display font-bold text-sm">Admin Panel</span>
          </div>
        </div>
        {/* Quick user indicator on mobile */}
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
          {user?.name?.[0] || 'A'}
        </div>
      </header>

      {/* Spacer for fixed mobile header */}
      <div className="lg:hidden h-14" />

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-[100dvh] w-64 lg:w-56 bg-card border-r border-border transition-transform duration-300 ease-out flex-shrink-0",
            "lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full max-h-[100dvh] pb-safe">
            {/* Mobile sidebar header with close button */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Shreerang" className="h-8 w-8 rounded-lg object-cover" />
                <div>
                  <h1 className="font-display font-bold text-foreground text-sm">श्रीरंग</h1>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Desktop Logo */}
            <div className="hidden lg:flex items-center gap-2 p-4 border-b border-border">
              <img src="/logo.png" alt="Shreerang" className="h-8 w-8 rounded-lg object-cover" />
              <div>
                <h1 className="font-display font-bold text-foreground text-sm">श्रीरंग</h1>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>

            {/* Navigation - scrollable with larger touch targets on mobile */}
            <nav className="flex-1 p-2 lg:p-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 lg:py-2 rounded-xl lg:rounded-lg text-sm font-medium transition-all",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/70"
                  )}
                >
                  <item.icon className="h-5 w-5 lg:h-4 lg:w-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {/* Optional: show chevron on mobile for active item */}
                  {location.pathname === item.path && (
                    <ChevronRight className="h-4 w-4 lg:hidden opacity-70" />
                  )}
                </Link>
              ))}
            </nav>

            {/* User section - larger on mobile */}
            <div className="p-3 lg:p-3 border-t border-border">
              <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-muted/50">
                <div className="h-10 w-10 lg:h-8 lg:w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
                  {user?.name?.[0] || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'admin@store.com'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="default"
                className="w-full h-11 lg:h-9 mb-4 lg:mb-0"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen overflow-x-hidden">
          <div className="p-4 lg:p-6 max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

