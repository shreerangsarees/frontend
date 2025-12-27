
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingBag, User, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

const MobileBottomNav: React.FC = () => {
    const { pathname } = useLocation();
    const { totalItems } = useCart();

    // Hide on specific pages like product details where we have other sticky buttons
    // or checkout
    const hiddenPaths = ['/checkout', '/product/'];
    const isHidden = hiddenPaths.some(path => pathname.includes(path));

    if (isHidden) return null;

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Grid, label: 'Categories', path: '/categories' },
        { icon: Heart, label: 'Wishlist', path: '/wishlist' }, // Assuming we have a wishlist route
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:hidden pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </NavLink>
                ))}

                {/* Cart Item - Special Case for Badge */}
                <NavLink
                    to="/cart"
                    className={({ isActive }) => cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                        isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                    )}
                >
                    <div className="relative">
                        <ShoppingBag className="h-5 w-5" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                                {totalItems > 9 ? '9+' : totalItems}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-medium">Cart</span>
                </NavLink>
            </div>
        </div>
    );
};

export default MobileBottomNav;
