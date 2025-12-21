import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, User, Menu, X, ChevronDown, LogOut, Package, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { storeInfo } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from '@/components/notifications/NotificationBell';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, totalAmount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'Offers', path: '/offers' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top bar - Store info */}
      <div className="bg-coral text-primary-foreground py-1.5">
        <div className="container-app flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delivering to</span>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="font-medium flex items-center gap-1 hover:underline focus:outline-none">
                    {user.addresses && user.addresses.length > 0
                      ? (user.addresses.find(a => a.is_default)?.label || user.addresses[0].label || user.addresses[0].city)
                      : 'Add Address'}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Saved Addresses</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.addresses && user.addresses.length > 0 ? (
                    user.addresses.map((address) => (
                      <DropdownMenuItem key={address._id || address.id} onClick={() => navigate('/profile')} className="flex flex-col items-start gap-1 cursor-pointer">
                        <div className="flex items-center gap-2 w-full">
                          <span className="font-medium">{address.label}</span>
                          {address.is_default && <span className="text-[10px] bg-coral/10 text-coral px-1.5 rounded">Default</span>}
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-1">{address.full_address}</span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-2 text-sm text-muted-foreground">No saved addresses</div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Manage Addresses</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="font-medium flex items-center gap-1 hover:underline"
              >
                Select Location
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">{storeInfo.openingHours}</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              {storeInfo.isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-app py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-coral flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">T</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-display font-bold text-foreground">T-Mart</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Fresh & Fast Delivery</p>
            </div>
          </Link>

          {/* Search bar - Desktop (Hidden on specific pages) */}
          {!['/checkout', '/cart', '/auth', '/order-success'].some(path => location.pathname.includes(path)) && (
            <div className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for groceries, vegetables, fruits..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                  className="input-search"
                />
              </div>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6 mr-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-coral",
                    location.pathname === link.path
                      ? "text-coral font-bold"
                      : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="cart" className="relative gap-2 px-4">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <>
                    <span className="hidden sm:inline font-medium">₹{totalAmount}</span>
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center animate-cart-bounce">
                      {totalItems}
                    </span>
                  </>
                )}
              </Button>
            </Link>

            {/* Notification Bell - only for logged in users */}
            {user && <NotificationBell />}

            {/* Account Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-auto px-3 rounded-full hidden sm:flex items-center gap-2 hover:bg-muted/50">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline font-medium">
                      Hi, {user?.name?.split(' ')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" forceMount>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-sm text-muted-foreground break-all">
                    {user?.name} <br />
                    <span className="text-xs">{user?.email}</span>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/my-orders')}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile search (Hidden on specific pages) */}
        {!['/checkout', '/cart', '/auth', '/order-success'].some(path => location.pathname.includes(path)) && (
          <div className="md:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                className="input-search"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card animate-slide-in-bottom">
          <nav className="container-app py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg font-medium transition-colors",
                  location.pathname === link.path
                    ? "bg-coral-light text-coral"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-px bg-border my-2 mx-4" />

            {user ? (
              <>
                <Link
                  to="/my-orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  My Orders
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
                >
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Admin Dashboard
                  </Link>
                )}
                <div
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
              >
                <User className="h-5 w-5" />
                Login / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
