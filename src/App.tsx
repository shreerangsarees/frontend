import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { SocketProvider } from "@/context/SocketContext";
import { NotificationProvider } from "@/context/NotificationContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import Offers from "./pages/Offers";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import OrderTracking from "./pages/OrderTracking";
import MyOrders from "./pages/MyOrders";
import ProductDetails from "./pages/ProductDetails";
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAnalytics from "./pages/admin/AdminAnalytics"; // Keep this as it was not explicitly removed
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCategories from './pages/admin/AdminCategories';
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import ScrollToTop from './components/layout/ScrollToTop';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SocketProvider>
      <SettingsProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner position="top-center" />
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/category/:categoryId" element={<CategoryProducts />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/order/:orderId" element={<OrderTracking />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/contact" element={<Contact />} />
                    {/* Admin routes */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/admin/categories" element={<AdminCategories />} />
                    <Route path="/admin/coupons" element={<AdminCoupons />} />
                    {/* Delivery routes */}
                    <Route path="/delivery" element={<DeliveryDashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </SettingsProvider>
    </SocketProvider>
  </QueryClientProvider>
);

export default App;
