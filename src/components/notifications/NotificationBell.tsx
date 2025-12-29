import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, AppNotification } from '@/context/NotificationContext';
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
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, requestPermission, deleteNotification } = useNotifications();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [permissionState, setPermissionState] = useState(() => {
        if ('Notification' in window) return Notification.permission;
        return 'default';
    });

    const handleEnableNotifications = async (e: React.MouseEvent) => {
        e.preventDefault();
        await requestPermission();
        if ('Notification' in window) {
            setPermissionState(Notification.permission);
        }
    };

    const handleNotificationClick = (notification: AppNotification) => {
        markAsRead(notification.id);
        if (notification.orderId) {
            navigate(`/order/${notification.orderId}`);
            setOpen(false);
        }
    };

    const getNotificationIcon = (type: AppNotification['type']) => {
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

    const formatTime = (dateInput: any) => {
        let date: Date;
        // Handle Firestore Timestamp
        if (dateInput && typeof dateInput === 'object') {
            if (dateInput.toDate && typeof dateInput.toDate === 'function') {
                date = dateInput.toDate();
            } else if (dateInput._seconds || dateInput.seconds) {
                const secs = dateInput._seconds || dateInput.seconds;
                date = new Date(secs * 1000);
            } else {
                date = new Date(dateInput);
            }
        } else {
            date = new Date(dateInput);
        }

        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-bold text-white flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96 max-w-[95vw] max-h-[80vh] overflow-y-auto rounded-xl shadow-xl border-border/50">
                <DropdownMenuLabel className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <span className="font-display font-bold text-base">Notifications</span>
                    <div className="flex items-center gap-2">
                        {permissionState !== 'granted' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                                onClick={handleEnableNotifications}
                            >
                                Enable Push
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs px-2 hover:bg-muted"
                                onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
                            >
                                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                </DropdownMenuLabel>

                {notifications.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Bell className="h-6 w-6 opacity-50" />
                        </div>
                        <p className="text-sm font-medium">No new notifications</p>
                        <p className="text-xs mt-1 opacity-70">We'll notify you when something happens</p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-border/30">
                            {notifications.filter(n => !n.read).slice(0, 10).map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "flex items-start gap-4 p-4 cursor-pointer focus:bg-muted/50",
                                        !notification.read ? "bg-primary/[0.03]" : "bg-transparent"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className={cn(
                                        "h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-lg shadow-sm border border-border/50",
                                        !notification.read ? "bg-background" : "bg-muted/30"
                                    )}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn(
                                                "text-sm leading-none",
                                                !notification.read ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                                            )}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                                                {formatTime(notification.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="h-2 w-2 rounded-full bg-primary shrink-0 self-center" />
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.id);
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuItem>
                            ))}
                        </div>

                        {notifications.length > 10 && (
                            <div className="py-3 text-center text-xs text-muted-foreground bg-muted/20 border-t border-border/30">
                                +{notifications.length - 10} more notifications
                            </div>
                        )}

                        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm p-3 border-t border-border/50 z-10">
                            <Button
                                variant="outline"
                                className="w-full h-9 text-xs gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20"
                                onClick={(e) => { e.preventDefault(); clearAll(); }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Clear all notifications
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
