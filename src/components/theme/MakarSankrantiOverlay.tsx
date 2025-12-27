import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MakarSankrantiOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [stage, setStage] = useState<'enter' | 'active' | 'exit'>('enter');

    useEffect(() => {
        // Sequence:
        // 0s: Show
        // 5s: Exit
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setStage('exit');
        setTimeout(() => {
            onClose();
        }, 1000); // Allow exit animation to finish
    };



    return (
        <AnimatePresence>
            {stage !== 'exit' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="fixed inset-0 z-[100] overflow-hidden font-display pointer-events-none" // pointer-events-none to let clicks pass through if needed, but we want to capture attention so maybe auto-dismiss or X button
                    style={{ pointerEvents: 'auto' }}
                >
                    {/* Sunrise Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-400 via-amber-200 to-blue-200 opacity-95 transition-opacity duration-1000" />

                    {/* Sun */}
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-t from-yellow-300 to-orange-500 blur-xl opacity-80"
                    />

                    {/* Skip Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full backdrop-blur-sm transition-all"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Content Container */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center p-6">

                        {/* Animated Kite 1 (Left) */}
                        <motion.div
                            initial={{ x: -200, y: 200, rotate: -45, opacity: 0 }}
                            animate={{
                                x: [-100, -50, -80],
                                y: [100, 50, 60],
                                rotate: [-15, -5, -10],
                                opacity: 1
                            }}
                            transition={{ duration: 4, ease: "easeInOut", times: [0, 0.5, 1] }}
                            className="absolute left-[10%] top-[20%] w-32 h-32 md:w-48 md:h-48"
                        >
                            <KiteSVG color1="#FF5722" color2="#FFC107" tailColor="#FF5722" />
                        </motion.div>

                        {/* Animated Kite 2 (Right) */}
                        <motion.div
                            initial={{ x: 200, y: 300, rotate: 45, opacity: 0 }}
                            animate={{
                                x: [100, 150, 120],
                                y: [150, 80, 100],
                                rotate: [15, 25, 20],
                                opacity: 1
                            }}
                            transition={{ duration: 4.5, ease: "easeInOut", delay: 0.5 }}
                            className="absolute right-[15%] top-[15%] w-24 h-24 md:w-40 md:h-40"
                        >
                            <KiteSVG color1="#00BCD4" color2="#3F51B5" tailColor="#00BCD4" />
                        </motion.div>

                        {/* Small Kite (Far Background) */}
                        <motion.div
                            initial={{ y: 500, opacity: 0 }}
                            animate={{ y: -50, opacity: 0.6 }}
                            transition={{ duration: 8, ease: "linear" }}
                            className="absolute left-[40%] top-[10%] w-16 h-16 blur-[1px]"
                        >
                            <KiteSVG color1="#E91E63" color2="#9C27B0" tailColor="#E91E63" />
                        </motion.div>


                        {/* Main Text */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-2xl max-w-lg mt-20"
                        >
                            <h1 className="text-4xl md:text-6xl font-black text-[#880E4F] drop-shadow-sm mb-2 tracking-wide" style={{ fontFamily: 'serif' }}>
                                Happy <br /> Makar Sankranti
                            </h1>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 1.5, duration: 1 }}
                                className="h-1 bg-[#880E4F]/30 mx-auto mb-4 rounded-full"
                            />
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2 }}
                                className="text-xl md:text-2xl font-bold text-[#E65100] drop-shadow-sm"
                            >
                                तिळगुळ घ्या, गोड गोड बोला
                            </motion.p>

                            <div className="flex justify-center gap-4 mt-6 opacity-100">
                                {/* Decorative Laddoos (Circles) */}
                                <div className="w-4 h-4 rounded-full bg-[#E6C685] border border-[#D4A353] shadow-sm transform hover:scale-110 transition-transform" />
                                <div className="w-4 h-4 rounded-full bg-[#D4A353] border border-[#Bcaaa4] shadow-sm transform hover:scale-110 transition-transform" />
                                <div className="w-4 h-4 rounded-full bg-[#E6C685] border border-[#D4A353] shadow-sm transform hover:scale-110 transition-transform" />
                            </div>
                        </motion.div>

                        {/* Rangoli Corners */}
                        <RangoliCorner className="absolute bottom-0 left-0 w-48 h-48 text-white/20 -rotate-90" />
                        <RangoliCorner className="absolute bottom-0 right-0 w-48 h-48 text-white/20" />

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Simple Kite SVG Component
const KiteSVG = ({ color1, color2, tailColor }: { color1: string, color2: string, tailColor: string }) => (
    <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-lg" style={{ overflow: 'visible' }}>
        {/* String/Manjha */}
        <path d="M50 100 Q 50 200 80 300" stroke="white" strokeWidth="0.5" fill="none" opacity="0.6" />

        {/* Tail */}
        <path d="M50 85 L 40 100 L 60 100 Z" fill={tailColor} />

        {/* Body */}
        <path d="M50 0 L 95 50 L 50 85 L 5 50 Z" fill={color1} />
        <path d="M50 0 L 95 50 L 50 50 Z" fill={color2} opacity="0.2" /> {/* Shading */}

        {/* Spine */}
        <path d="M50 0 L 50 85" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        <path d="M5 50 Q 50 40 95 50" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    </svg>
);

// Decorative Rangoli SVG
const RangoliCorner = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M0 100 L 100 100 L 100 0 Q 50 50 0 100 Z" fill="currentColor" fillOpacity="0.1" />
        <circle cx="90" cy="90" r="5" />
        <circle cx="70" cy="90" r="3" />
        <circle cx="90" cy="70" r="3" />
        <path d="M100 80 Q 80 80 80 100" />
        <path d="M100 60 Q 60 60 60 100" />
        <path d="M100 40 Q 40 40 40 100" />
    </svg>
);

export default MakarSankrantiOverlay;
