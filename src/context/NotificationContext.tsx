import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

export interface Notification {
    id: string;
    type: 'order_placed' | 'order_processing' | 'order_shipped' | 'order_out_for_delivery' | 'order_delivered' | 'order_cancelled' | 'new_order';
    title: string;
    message: string;
    orderId?: string;
    timestamp: Date;
    read: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    addNotification: () => { },
    markAsRead: () => { },
    markAllAsRead: () => { },
    clearAll: () => { },
});

export const useNotifications = () => useContext(NotificationContext);

const statusMessages: Record<string, { title: string; message: string }> = {
    'Placed': { title: 'Order Placed! 🎉', message: 'Your order has been placed successfully.' },
    'Processing': { title: 'Order Processing 👨‍🍳', message: 'Your order is being prepared.' },
    'Shipped': { title: 'Order Shipped 📦', message: 'Your order has been shipped.' },
    'Out for Delivery': { title: 'Out for Delivery 🚗', message: 'Your order is on the way!' },
    'Delivered': { title: 'Order Delivered ✅', message: 'Your order has been delivered. Enjoy!' },
    'Cancelled': { title: 'Order Cancelled ❌', message: 'Your order has been cancelled.' },
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { socket, isConnected } = useSocket();
    const { user, isAdmin } = useAuth();

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            read: false,
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50 notifications

        // Play notification sound
        try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => { }); // Ignore errors if sound fails
        } catch (e) { }

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, { body: notification.message });
        }
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Listen for order status updates
    useEffect(() => {
        if (socket && isConnected && user) {
            // For regular users - listen for their order updates
            socket.on('orderStatusUpdated', (data: { orderId: string; status: string }) => {
                const statusInfo = statusMessages[data.status];
                if (statusInfo) {
                    addNotification({
                        type: `order_${data.status.toLowerCase().replace(/ /g, '_')}` as Notification['type'],
                        title: statusInfo.title,
                        message: statusInfo.message,
                        orderId: data.orderId,
                    });
                }
            });

            // For admins - listen for new orders
            if (isAdmin) {
                socket.emit('joinAdminRoom');

                socket.on('newOrder', (data: { orderId: string; totalAmount: number }) => {
                    addNotification({
                        type: 'new_order',
                        title: 'New Order! 🛒',
                        message: `New order received: ₹${data.totalAmount}`,
                        orderId: data.orderId,
                    });
                });
            }

            return () => {
                socket.off('orderStatusUpdated');
                socket.off('newOrder');
            };
        }
    }, [socket, isConnected, user, isAdmin, addNotification]);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
