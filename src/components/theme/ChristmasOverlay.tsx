import React, { useEffect, useState } from 'react';
import { X, Snowflake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChristmasOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [stage, setStage] = useState<'enter' | 'active' | 'exit'>('enter');

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setStage('exit');
        setTimeout(() => onClose(), 1000);
    };

    return (
        <AnimatePresence>
            {stage !== 'exit' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-red-950/90"
                >
                    {/* Snowfall Background */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(50)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -10, x: Math.random() * window.innerWidth, opacity: 0 }}
                                animate={{
                                    y: window.innerHeight + 20,
                                    x: Math.random() * window.innerWidth + (Math.random() * 100 - 50),
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: Math.random() * 5 + 3,
                                    repeat: Infinity,
                                    delay: Math.random() * 5,
                                    ease: "linear"
                                }}
                                className="absolute text-white/40"
                            >
                                <Snowflake size={Math.random() * 20 + 10} />
                            </motion.div>
                        ))}
                    </div>

                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>

                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 pointer-events-none">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-20 -left-20 w-96 h-96 bg-green-800/20 rounded-full blur-[100px]"
                        />
                        <motion.div
                            animate={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-20 -right-20 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]"
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center px-4">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20"
                        >
                            <span className="text-6xl filter drop-shadow-lg">🎄</span>
                        </motion.div>

                        <motion.h1
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-red-500 drop-shadow-lg mb-4"
                            style={{ fontFamily: 'serif' }}
                        >
                            Merry Christmas
                        </motion.h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-xl md:text-2xl text-white/90 font-light tracking-wide max-w-lg mx-auto"
                        >
                            Wishing you warmth, joy, and festive cheer this holiday season!
                        </motion.p>

                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="h-px w-32 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mt-8"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChristmasOverlay;
