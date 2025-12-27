import React from 'react';
import Layout from '@/components/layout/Layout';
import { ArrowLeft, Heart, Award, Users, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
    return (
        <Layout>
            <div className="container-app py-8">
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                </Link>

                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-display font-bold text-foreground mb-4">About Shreerang Saree</h1>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-lg text-muted-foreground mb-8">
                            Welcome to Shreerang Saree, your trusted destination for exquisite traditional and contemporary sarees.
                            We bring you the finest handcrafted sarees from across India, celebrating the rich heritage of Indian textiles.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-12">
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <Heart className="h-10 w-10 text-primary mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Our Passion</h3>
                                <p className="text-muted-foreground">
                                    Every saree tells a story. We are passionate about bringing authentic,
                                    beautifully crafted sarees that honor traditional artisanship.
                                </p>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <Award className="h-10 w-10 text-primary mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Quality Promise</h3>
                                <p className="text-muted-foreground">
                                    We source directly from master weavers and ensure every piece
                                    meets our high standards of quality and authenticity.
                                </p>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <Users className="h-10 w-10 text-primary mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Customer First</h3>
                                <p className="text-muted-foreground">
                                    Your satisfaction is our priority. We offer personalized service
                                    and expert guidance to help you find the perfect saree.
                                </p>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <Truck className="h-10 w-10 text-primary mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Pan-India Delivery</h3>
                                <p className="text-muted-foreground">
                                    We deliver across India with secure packaging to ensure
                                    your saree reaches you in perfect condition.
                                </p>
                            </div>
                        </div>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Our Collection</h2>
                            <p className="text-muted-foreground">
                                From luxurious Banarasi silks and elegant Kanjivaram sarees to comfortable
                                cotton weaves and trendy designer pieces, our collection caters to every occasion -
                                weddings, festivals, office wear, and casual elegance.
                            </p>
                        </section>

                        <section className="bg-primary/5 rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-2">Visit Us</h2>
                            <p className="text-muted-foreground mb-4">
                                Have questions? Feel free to <Link to="/contact" className="text-primary hover:underline">contact us</Link> or
                                explore our <Link to="/products" className="text-primary hover:underline">collection</Link>.
                            </p>
                            <div className="border-t border-border/10 pt-4 mt-4">
                                <p className="text-sm text-muted-foreground font-mono">
                                    <strong>GSTIN:</strong> 27AJBPR98861ZZ
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default About;
