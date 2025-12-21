import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Order {
    id: string;
    status: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
    profiles: {
        full_name: string | null;
        phone: string | null;
    } | null;
    addresses: {
        full_address: string;
        city: string;
        pincode: string;
    } | null;
}

const DeliveryDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || profile?.role !== 'delivery')) {
            // If not delivery partner, redirect home or admin
            if (profile?.role === 'admin') navigate('/admin');
            else navigate('/');
        }
    }, [user, profile, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders/delivery');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            toast.error('Failed to load deliveries');
        } finally {
            setLoading(false);
        }
    };

    const markAsDelivered = async (orderId: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Delivered' })
            });

            if (res.ok) {
                toast.success('Order marked as delivered');
                fetchOrders(); // Refresh list
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <p>Loading...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <Header />
            <main className="flex-1 container-app py-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-coral/10 flex items-center justify-center text-coral">
                        <Truck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-foreground">Delivery Dashboard</h1>
                        <p className="text-muted-foreground">Manage your assigned deliveries</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-sm">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground">No active deliveries</h3>
                        <p className="text-muted-foreground">You have no orders currently out for delivery.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {orders.map(order => (
                            <div key={order.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs font-medium bg-coral/10 text-coral px-2 py-1 rounded-full">
                                            Out for Delivery
                                        </span>
                                        <h3 className="font-semibold mt-2 text-lg">#{order.id.slice(0, 8)}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">₹{order.total_amount}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{order.payment_method}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">{order.profiles?.full_name || 'Guest'}</p>
                                            <p className="text-sm text-muted-foreground">{order.addresses?.full_address}, {order.addresses?.city}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">PIN: {order.addresses?.pincode}</p>
                                        </div>
                                    </div>
                                    {order.profiles?.phone && (
                                        <p className="text-sm text-muted-foreground pl-6">
                                            📞 {order.profiles.phone}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={() => markAsDelivered(order.id)}
                                >
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Mark Delivered
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default DeliveryDashboard;
