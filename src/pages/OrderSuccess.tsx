import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

const OrderSuccess: React.FC = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();

    useEffect(() => {
        // Auto redirect after 5 seconds
        const timer = setTimeout(() => {
            navigate('/my-orders');
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <Layout>
            <div className="container-app min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md w-full p-6 animate-slide-up">
                    {/* Animated Success Icon */}
                    <div className="relative mx-auto h-24 w-24 mb-6">
                        <div className="absolute inset-0 bg-success/20 rounded-full animate-ping opacity-75"></div>
                        <div className="relative h-full w-full bg-success/10 rounded-full flex items-center justify-center">
                            <div className="h-16 w-16 bg-success rounded-full flex items-center justify-center shadow-lg shadow-success/30">
                                <Check className="h-8 w-8 text-primary-foreground stroke-[3]" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Thank you for your order. We have received it and will begin processing it right away.
                    </p>

                    <div className="space-y-3">
                        <Button
                            variant="hero"
                            size="lg"
                            className="w-full"
                            onClick={() => navigate(`/order/${orderId}`)}
                        >
                            Track Order
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-foreground"
                            onClick={() => navigate('/')}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default OrderSuccess;
