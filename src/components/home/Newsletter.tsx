import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

const Newsletter = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Mock API call
        setTimeout(() => {
            toast.success("Welcome to the family!", {
                description: "You've successfully subscribed to our newsletter."
            });
            setEmail('');
        }, 800);
    };

    return (
        <section className="py-16 bg-muted/50">
            <div className="container-app">
                <div className="bg-primary rounded-3xl p-8 md:p-12 relative overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                                Join the Shreerang Family
                            </h2>
                            <p className="text-primary-foreground/80 text-lg max-w-md mx-auto md:mx-0">
                                Be the first to know about new arrivals, sales, and exclusive offers.
                                <span className="font-semibold text-white ml-1">Get 10% off your first order!</span>
                            </p>
                        </div>

                        <div className="w-full max-w-md">
                            <form onSubmit={handleSubscribe} className="flex gap-2 p-1.5 bg-white rounded-full shadow-lg">
                                <div className="pl-4 flex items-center pointer-events-none text-muted-foreground">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="border-none shadow-none focus-visible:ring-0 bg-transparent"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Button type="submit" className="rounded-full px-6">
                                    Subscribe
                                </Button>
                            </form>
                            <p className="text-primary-foreground/60 text-xs mt-3 text-center md:text-left pl-4">
                                We respect your privacy. Unsubscribe at any time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
