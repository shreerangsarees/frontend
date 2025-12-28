import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Package, Truck, CheckCircle, Clock, MapPin, ArrowLeft, Search, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/apiConfig';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const TrackOrder: React.FC = () => {
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orderId.trim()) {
            toast.error('Please enter an order ID');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
            if (res.ok) {
                navigate(`/order/${orderId}`);
            } else {
                toast.error('Order not found. Please check the order ID.');
            }
        } catch (error) {
            toast.error('Unable to track order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container-app py-8">
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                </Link>

                <div className="max-w-xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="h-16 w-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
                            <Package className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Track Your Order</h1>
                        <p className="text-muted-foreground">
                            Enter your order ID to check the delivery status
                        </p>
                    </div>

                    <form onSubmit={handleTrack} className="bg-card border border-border rounded-xl p-6">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Order ID</label>
                            <Input
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Enter your order ID"
                                className="text-center text-lg"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                You can find your order ID in the confirmation email or in "My Orders" section.
                            </p>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Search className="h-4 w-4 mr-2" />
                            )}
                            Track Order
                        </Button>
                    </form>

                    <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                        <Link
                            to="/my-orders"
                            className="bg-card border border-border rounded-xl p-4 hover:border-primary transition-colors"
                        >
                            <p className="font-medium">My Orders</p>
                            <p className="text-sm text-muted-foreground">View all orders</p>
                        </Link>
                        <Link
                            to="/contact"
                            className="bg-card border border-border rounded-xl p-4 hover:border-primary transition-colors"
                        >
                            <p className="font-medium">Need Help?</p>
                            <p className="text-sm text-muted-foreground">Contact support</p>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TrackOrder;
