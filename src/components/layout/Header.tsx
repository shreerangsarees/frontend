import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, User, Menu, X, ChevronDown, LogOut, Package, LayoutDashboard, Settings, Truck, Heart } from 'lucide-react';
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
import SearchAutocomplete from '@/components/search/SearchAutocomplete';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, totalAmount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();

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
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container-app flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 opacity-90">
              <MapPin className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delivering to:</span>
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="font-semibold flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded transition-colors focus:outline-none">
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                      {user.addresses && user.addresses.length > 0
                        ? (user.addresses.find(a => a.is_default)?.label || user.addresses[0].label || user.addresses[0].city)
                        : 'Add Address'}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 p-2">
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground uppercase tracking-wider">Saved Addresses</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.addresses && user.addresses.length > 0 ? (
                    <div className="max-h-[200px] overflow-y-auto scrollbar-hide space-y-1">
                      {user.addresses.map((address) => (
                        <DropdownMenuItem key={address._id || address.id} onClick={() => navigate('/profile')} className="flex flex-col items-start gap-1 cursor-pointer p-3 rounded-md hover:bg-muted focus:bg-muted">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium flex items-center gap-2">
                              {address.label}
                              {address.is_default && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">Default</span>}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{address.full_address}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg border border-dashed m-1">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      No saved addresses
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="justify-center text-primary font-medium py-2.5 cursor-pointer hover:bg-primary/5">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Locations
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="font-semibold flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded transition-colors"
              >
                Select Location
                <ChevronDown className="h-3.5 w-3.5 opacity-80" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline opacity-90">{storeInfo.openingHours}</span>
            <span className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full text-xs font-medium">
              <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
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
            <img src="/logo.png" alt="Shreerang Saree" className="h-12 w-12 rounded-lg object-cover" />
            <div>
              <h1 className="text-xl font-display font-bold text-primary">श्रीरंग</h1>
              <p className="text-xs font-medium text-black -mt-0.5">साडी ही संस्कृती अतूट ऋणानुबंध</p>
            </div>
          </Link>

          {/* Search bar - Desktop (Hidden on specific pages) */}
          {!['/checkout', '/cart', '/auth', '/order-success'].some(path => location.pathname.includes(path)) && (
            <div className="hidden md:flex flex-1 max-w-xl">
              <SearchAutocomplete placeholder="Search for sarees, silk, cotton, designer..." />
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
                    "relative px-1 py-2 text-sm font-medium transition-colors group",
                    location.pathname === link.path
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {/* Top Line */}
                  <span className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-primary/80 transition-all duration-300 ease-out group-hover:w-full",
                    location.pathname === link.path && "w-full"
                  )} />

                  {link.name}

                  {/* Bottom Line */}
                  <span className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-primary/80 transition-all duration-300 ease-out group-hover:w-full",
                    location.pathname === link.path && "w-full"
                  )} />
                </Link>
              ))}
            </nav>

            {/* Cart */}
            <Link to="/cart" className="hidden md:flex">
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
                  {!isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/my-orders')}>
                        <Package className="mr-2 h-4 w-4" />
                        <span>My Orders</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                        <Heart className="mr-2 h-4 w-4" />
                        <span>My Wishlist</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user?.role === 'delivery' && (
                    <DropdownMenuItem onClick={() => navigate('/delivery')}>
                      <Truck className="mr-2 h-4 w-4" />
                      <span>Delivery Dashboard</span>
                    </DropdownMenuItem>
                  )}
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
          <div className="md:hidden mt-3 pb-2">
            <SearchAutocomplete placeholder="Search for sarees..." />
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card animate-slide-in-bottom">
          <nav className="container-app py-4 flex flex-col gap-1">
            {navLinks.filter(link => !['Home', 'Categories'].includes(link.name)).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg font-medium transition-colors",
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-px bg-border my-2 mx-4" />

            {user ? (
              <>
                {/* User info with avatar for mobile */}
                <div className="px-4 py-3 flex items-center gap-3 bg-muted/30 rounded-lg mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
                    <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                {!isAdmin && (
                  <Link
                    to="/my-orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <Package className="h-5 w-5" />
                    My Orders
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
                >
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
                {user?.role === 'delivery' && (
                  <Link
                    to="/delivery"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-lg font-medium text-primary hover:bg-primary/10 flex items-center gap-2"
                  >
                    <Truck className="h-5 w-5" />
                    Delivery Dashboard
                  </Link>
                )}
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
