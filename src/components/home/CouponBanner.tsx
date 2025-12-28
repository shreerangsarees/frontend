import React, { useEffect, useState } from 'react';
import { Copy, Check, Gift, Sparkles, TicketPercent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/apiConfig';
import { formatDate, parseDate } from '@/lib/dateUtils';

interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'flat';
    discountAmount: number;
    minOrderValue: number;
    expiryDate: string;
    isActive: boolean;
}

const CouponBanner = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/coupons/active`);
            if (res.ok) {
                const data = await res.json();
                // Filter active coupons that haven't expired
                const activeCoupons = data.filter((c: Coupon) =>
                    c.isActive && parseDate(c.expiryDate).getTime() > new Date().getTime()
                );
                setCoupons(activeCoupons); // Show all active coupons
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Coupon code "${code}" copied!`);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (loading || coupons.length === 0) return null;

    return (
        <section className="py-6 sm:py-10 bg-gradient-to-r from-primary/5 via-golden/5 to-teal/5">
            <div className="container-app">
                <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
                    <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-bounce" />
                    <h2 className="text-xl sm:text-3xl font-display font-bold text-foreground">
                        Exclusive Offers
                    </h2>
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-golden" />
                </div>

                <div className="flex overflow-x-auto pb-6 gap-4 sm:gap-6 snap-x scrollbar-hide">
                    {coupons.map((coupon) => (
                        <div
                            key={coupon._id}
                            className="min-w-[300px] sm:min-w-[350px] snap-center relative overflow-hidden bg-card rounded-xl sm:rounded-2xl border-2 border-dashed border-primary/40 p-5 sm:p-6 hover:border-primary hover:shadow-lg transition-all group flex-shrink-0"
                        >
                            {/* Ticket cutout effect */}
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-background rounded-full" />
                            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-background rounded-full" />

                            {/* Decorative ribbon */}
                            <div className="absolute -top-1 -right-8 bg-primary text-white text-xs font-bold py-1 px-8 rotate-45">
                                SAVE
                            </div>

                            <div className="text-center">
                                {/* Discount badge */}
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-2 rounded-full text-lg font-bold mb-4 shadow-md">
                                    <TicketPercent className="h-5 w-5" />
                                    {coupon.discountType === 'percentage'
                                        ? `${coupon.discountAmount}% OFF`
                                        : `₹${coupon.discountAmount} OFF`}
                                </div>

                                {/* Coupon code with copy button */}
                                <div
                                    onClick={() => copyToClipboard(coupon.code)}
                                    className="flex items-center justify-center gap-3 bg-muted/80 rounded-xl py-4 px-5 cursor-pointer hover:bg-muted transition-colors border border-border"
                                >
                                    <span className="font-mono font-bold text-xl tracking-widest text-foreground">
                                        {coupon.code}
                                    </span>
                                    {copiedCode === coupon.code ? (
                                        <Check className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <Copy className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                </div>

                                {/* Terms */}
                                <p className="text-sm text-muted-foreground mt-4">
                                    Min. order <span className="font-semibold text-foreground">₹{coupon.minOrderValue}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Valid till {formatDate(coupon.expiryDate, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CouponBanner;
