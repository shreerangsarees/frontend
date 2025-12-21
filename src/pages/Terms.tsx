import React from 'react';
import Layout from '@/components/layout/Layout';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
    return (
        <Layout>
            <div className="container-app py-8">
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                </Link>

                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-display font-bold text-foreground mb-8">Terms & Conditions</h1>

                    <div className="prose prose-gray dark:prose-invert">
                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground mb-4">
                                By accessing and using T-Mart Express, you accept and agree to be bound by these Terms and Conditions.
                                If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">2. Use of Service</h2>
                            <p className="text-muted-foreground mb-4">
                                You agree to use our service only for lawful purposes and in accordance with these Terms.
                                You must be at least 18 years old to place an order.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">3. Orders and Payments</h2>
                            <p className="text-muted-foreground mb-4">
                                All orders are subject to availability and confirmation. Prices are subject to change without notice.
                                We accept various payment methods including Cash on Delivery and online payments via Razorpay.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">4. Delivery</h2>
                            <p className="text-muted-foreground mb-4">
                                We aim to deliver your order within 30-45 minutes. Delivery times may vary based on location,
                                weather conditions, and order volume. Free delivery is available on orders above ₹499.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">5. Cancellation and Refunds</h2>
                            <p className="text-muted-foreground mb-4">
                                Orders can be cancelled before they are dispatched for delivery.
                                Refunds for prepaid orders will be processed within 5-7 business days.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">6. Contact Us</h2>
                            <p className="text-muted-foreground mb-4">
                                For any queries regarding these terms, please contact us at:<br />
                                Phone: 7096867438<br />
                                Email: support@tmart.com
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Terms;
