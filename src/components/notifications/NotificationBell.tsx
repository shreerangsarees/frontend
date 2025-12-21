import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, Notification } from '@/context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.orderId) {
            navigate(`/order/${notification.orderId}`);
            setOpen(false);
        }
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'order_placed':
                return '🎉';
            case 'order_processing':
                return '👨‍🍳';
            case 'order_shipped':
                return '📦';
            case 'order_out_for_delivery':
                return '🚗';
            case 'order_delivered':
                return '✅';
            case 'order_cancelled':
                return '❌';
            case 'new_order':
                return '🛒';
            default:
                return '📢';
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-coral text-[11px] font-bold text-white flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="font-display font-bold">Notifications</span>
                    {notifications.length > 0 && (
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
                            >
                                <CheckCheck className="h-3 w-3 mr-1" />
                                Mark all read
                            </Button>
                        </div>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <>
                        {notifications.slice(0, 10).map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex items-start gap-3 p-3 cursor-pointer",
                                    !notification.read && "bg-coral/5"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm truncate",
                                        !notification.read && "font-semibold"
                                    )}>
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatTime(notification.timestamp)}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="h-2 w-2 rounded-full bg-coral shrink-0 mt-1.5" />
                                )}
                            </DropdownMenuItem>
                        ))}

                        {notifications.length > 10 && (
                            <div className="py-2 text-center text-xs text-muted-foreground">
                                +{notifications.length - 10} more notifications
                            </div>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="justify-center text-sm text-muted-foreground hover:text-destructive"
                            onClick={(e) => { e.preventDefault(); clearAll(); }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear all notifications
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
