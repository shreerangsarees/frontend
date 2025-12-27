
import React from 'react';
import { motion } from 'framer-motion';

// --- Components ---

export const DeliveryScooter = () => {
    return (
        <div className="relative h-20 w-full overflow-hidden my-8 bg-transparent">
            {/* Moving Traditional Border Pattern */}
            <motion.div
                className="absolute flex whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                {Array(10).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center text-primary/20 px-4">
                        <svg width="60" height="40" viewBox="0 0 60 40" fill="currentColor">
                            <path d="M30 0C35 10 45 10 50 0C55 10 60 20 50 30C45 40 35 40 30 30C25 40 15 40 10 30C0 20 5 10 10 0C15 10 25 10 30 0Z" />
                        </svg>
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor" className="ml-4">
                            <circle cx="20" cy="20" r="10" />
                            <path d="M20 0L25 15L40 20L25 25L20 40L15 25L0 20L15 15Z" />
                        </svg>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export const FloatingGroceries = () => {
    // Fashion / Saree related icons
    const items = [
        { icon: "🧵", top: "10%", left: "5%", delay: 0 }, // Thread
        { icon: "✨", top: "20%", right: "8%", delay: 2 }, // Sparkle
        { icon: "👗", top: "60%", left: "3%", delay: 1 }, // Dress/Saree equivalent
        { icon: "🛍️", top: "80%", right: "12%", delay: 3 }, // Shopping Bag
        { icon: "🧶", bottom: "15%", left: "15%", delay: 0.5 }, // Yarn
        { icon: "🏵️", top: "40%", right: "40%", delay: 1.5 }, // Flower/Motif
    ];

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
            {items.map((item, i) => (
                <motion.div
                    key={i}
                    className="absolute text-4xl blur-[1px]"
                    style={{ top: item.top, left: item.left, right: item.right, bottom: item.bottom }}
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        delay: item.delay,
                        ease: "easeInOut"
                    }}
                >
                    {item.icon}
                </motion.div>
            ))}
        </div>
    );
};

export const DiscountMarquee = () => {
    return (
        <div className="w-full bg-yellow-400 py-2 overflow-hidden rotate-1 transform scale-105 my-8 border-y-4 border-black">
            <motion.div
                className="whitespace-nowrap text-xl font-black uppercase text-black flex gap-8"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
                {Array(20).fill("⚡ FLASH SALE: UP TO 70% OFF • FREE DELIVERY ON FIRST ORDER • ").map((text, i) => (
                    <span key={i}>{text}</span>
                ))}
            </motion.div>
        </div>
    );
};

// "Live" Badge Pulse
export const LiveBadge = () => (
    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold border border-red-200">
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        LIVE OFFERS
    </div>
);
