import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { API_BASE_URL } from '@/apiConfig';
import api from '@/api/axios';

export interface AppNotification {
    id: string;
    type: 'order_placed' | 'order_processing' | 'order_shipped' | 'order_out_for_delivery' | 'order_delivered' | 'order_cancelled' | 'new_order';
    title: string;
    message: string;
    orderId?: string;
    timestamp: Date;
    read: boolean;
}

interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    deleteNotification: (id: string) => void;
    requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    addNotification: () => { },
    markAsRead: () => { },
    markAllAsRead: () => { },
    clearAll: () => { },
    deleteNotification: () => { },
    requestPermission: async () => { },
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
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const { socket, isConnected } = useSocket();
    const { user, isAdmin } = useAuth();

    const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: AppNotification = {
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
        } catch (e) {
            console.warn('Failed to play notification sound:', e);
        }

        // Browser push notifications are now handled by FCM
        // No need to manually create Notification here
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        // Call API
        api.put(`/notifications/${id}/read`).catch(console.error);
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        api.delete('/notifications').catch(console.error);
    }, []);

    const deleteNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        api.delete(`/notifications/${id}`).catch(console.error);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Fetch initial notifications
    useEffect(() => {
        if (user) {
            api.get('/notifications')
                .then(res => {
                    const data = res.data;
                    // Map API data to Context shape if needed
                    const mapped = data.map((n: any) => ({
                        ...n,
                        // Ensure timestamp is a Date object (Firestore returns object with seconds/nanoseconds or ISO string)
                        timestamp: n.createdAt && n.createdAt._seconds
                            ? new Date(n.createdAt._seconds * 1000)
                            : new Date(n.createdAt || Date.now())
                    }));
                    setNotifications(mapped);
                })
                .catch(err => console.error(err));
        }
    }, [user]);

    // Listen for order status updates
    useEffect(() => {
        if (socket && isConnected && user) {
            // Join user-specific room to receive notifications
            socket.emit('joinUserRoom', { userId: user.id });

            // For regular users - listen for their order updates
            socket.on('orderStatusUpdated', (data: { orderId: string; status: string }) => {
                const statusInfo = statusMessages[data.status];
                if (statusInfo) {
                    addNotification({
                        type: `order_${data.status.toLowerCase().replace(/ /g, '_')}` as AppNotification['type'],
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

    const requestPermission = useCallback(async () => {
        if (!messaging) return;

        try {
            // console.log('[FCM-Frontend] Requesting permission...');
            if (!('Notification' in window)) {
                // console.log('[FCM-Frontend] Notifications not supported in this browser/context');
                return;
            }

            const permission = await Notification.requestPermission();
            // console.log('[FCM-Frontend] Permission result:', permission);

            if (permission === 'granted') {
                const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

                // Explicitly register service worker
                let registration;
                try {
                    registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                        scope: '/firebase-cloud-messaging-push-scope'
                    });
                    // console.log('[FCM-Frontend] SW registered:', registration);
                } catch (swError) {
                    console.error('[FCM-Frontend] SW registration failed, trying default:', swError);
                    // Fallback to default registration attempt or existing one
                    registration = await navigator.serviceWorker.ready;
                }

                const token = await getToken(messaging, {
                    vapidKey: vapidKey,
                    serviceWorkerRegistration: registration
                });
                // console.log('[FCM-Frontend] Token retrieved:', token);

                if (token && user) {
                    const idToken = localStorage.getItem('tmart_token');
                    if (!idToken) {
                        console.error('[FCM-Frontend] No auth token found in localStorage');
                        return;
                    }
                    fetch(`${API_BASE_URL}/notifications/register-token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${idToken}`
                        },
                        body: JSON.stringify({ token })
                    })
                        .then(res => res.json())
                        .then(data => { }) // console.log('[FCM-Frontend] Token registration response:', data))
                        .catch(err => console.error('[FCM-Frontend] Token registration error:', err));
                }
            }
        } catch (error) {
            console.error('[FCM-Frontend] Error requesting permission/token:', error);
        }
    }, [user]);

    // Request notification permission and handle FCM on mount if already granted
    useEffect(() => {
        const checkPermission = async () => {
            if ('Notification' in window && Notification.permission === 'granted') {
                requestPermission();
            }
        };
        checkPermission();
    }, [requestPermission]);

    // Listen for foreground messages
    useEffect(() => {
        if (!messaging) return;

        const unsubscribe = onMessage(messaging, (payload) => {
            // console.log('Foreground FCM message received (suppressed UI update as Socket handles it):', payload);
            // We do NOT call addNotification here because the Socket.IO listener 
            // already handles the immediate UI update for order status changes.
            // This prevents duplicate notifications.
        });

        return () => unsubscribe();
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAll,
            deleteNotification,
            requestPermission
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
