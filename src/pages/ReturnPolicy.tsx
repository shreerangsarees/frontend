import React from 'react';
import Layout from '@/components/layout/Layout';
import { ArrowLeft, RotateCcw, Package, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReturnPolicy: React.FC = () => {
    return (
        <Layout>
            <div className="container-app py-8">
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                </Link>

                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                            <RotateCcw className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold text-foreground">Return & Refund Policy</h1>
                            <p className="text-muted-foreground">Easy returns within 7 days</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                            <h3 className="font-semibold">7 Days</h3>
                            <p className="text-sm text-muted-foreground">Return Window</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                            <h3 className="font-semibold">Free Pickup</h3>
                            <p className="text-sm text-muted-foreground">We collect the item</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4 text-center">
                            <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                            <h3 className="font-semibold">Quick Refund</h3>
                            <p className="text-sm text-muted-foreground">Within 5-7 days</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                        <section>
                            <h2 className="text-xl font-bold mb-3">Eligibility for Returns</h2>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>• Item must be unused, unwashed, and in original packaging</li>
                                <li>• All tags and labels must be intact</li>
                                <li>• Return request must be initiated within 7 days of delivery</li>
                                <li>• Item must not be damaged by the customer</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3">Non-Returnable Items</h2>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>• Customized or altered sarees</li>
                                <li>• Items marked as "Final Sale" or "Non-Returnable"</li>
                                <li>• Intimate accessories like blouses (unless defective)</li>
                                <li>• Items with removed tags or labels</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3">How to Initiate a Return</h2>
                            <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                                <li>Go to "My Orders" and select the order you wish to return</li>
                                <li>Click "Return Item" and select the reason</li>
                                <li>Schedule a pickup or drop at the nearest courier partner</li>
                                <li>Once we receive and verify the item, refund will be processed</li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3">Refund Timeline</h2>
                            <p className="text-muted-foreground">
                                Refunds are processed within 5-7 business days after we receive the returned item.
                                The amount will be credited to your original payment method. For COD orders,
                                refund will be processed via bank transfer.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold mb-3">Exchange Policy</h2>
                            <p className="text-muted-foreground">
                                Currently, we don't offer direct exchanges. Please return the item and place a
                                new order for the desired product.
                            </p>
                        </section>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground">Need help with a return?</p>
                        <Link to="/contact" className="text-primary font-medium hover:underline">
                            Contact Support →
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ReturnPolicy;
