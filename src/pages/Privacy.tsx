import React from 'react';
import Layout from '@/components/layout/Layout';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
    return (
        <Layout>
            <div className="container-app py-8">
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                </Link>

                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-display font-bold text-foreground mb-8">Privacy Policy</h1>

                    <div className="prose prose-gray dark:prose-invert">
                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">1. Information We Collect</h2>
                            <p className="text-muted-foreground mb-4">
                                We collect information you provide directly to us, including your name, email address,
                                phone number, delivery address, and payment information when you place an order.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">2. How We Use Your Information</h2>
                            <p className="text-muted-foreground mb-4">
                                We use the information we collect to process and deliver your orders, send you order updates,
                                provide customer support, and improve our services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">3. Information Sharing</h2>
                            <p className="text-muted-foreground mb-4">
                                We do not sell or share your personal information with third parties except as necessary
                                to provide our services (e.g., delivery partners, payment processors).
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">4. Data Security</h2>
                            <p className="text-muted-foreground mb-4">
                                We implement appropriate security measures to protect your personal information.
                                All payment transactions are processed through secure payment gateways.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">5. Cookies</h2>
                            <p className="text-muted-foreground mb-4">
                                We use cookies to enhance your browsing experience, remember your preferences,
                                and analyze site traffic.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">6. Your Rights</h2>
                            <p className="text-muted-foreground mb-4">
                                You have the right to access, update, or delete your personal information.
                                Contact us at shreerangsaree@gmail.com for any privacy-related requests.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4">7. Contact Us</h2>
                            <p className="text-muted-foreground mb-4">
                                If you have questions about this Privacy Policy, please contact us at:<br />
                                Phone: 9137554336<br />
                                Email: shreerangsaree@gmail.com
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Privacy;
