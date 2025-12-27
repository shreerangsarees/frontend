import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DiwaliOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [stage, setStage] = useState<'enter' | 'active' | 'exit'>('enter');

    useEffect(() => {
        const timer = setTimeout(() => handleClose(), 5000);
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
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/95"
                >
                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 z-50 text-yellow-500 hover:text-yellow-200 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>

                    {/* Dark Background with Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-900 to-slate-900" />

                    {/* Fireworks Effect (CSS/Motion) */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0, x: Math.random() * window.innerWidth, y: window.innerHeight }}
                            animate={{ scale: [0, 1.5, 2], opacity: [1, 1, 0], y: Math.random() * window.innerHeight * 0.5 }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: Math.random() * 2, delay: Math.random() }}
                            className="absolute w-2 h-2 rounded-full bg-yellow-400 blur-sm shadow-[0_0_20px_10px_rgba(250,204,21,0.5)]"
                        />
                    ))}

                    <div className="relative z-10 text-center flex flex-col items-center">
                        {/* Diya Graphic */}
                        {/* Realistic Diya Image */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1 }}
                            className="relative w-72 h-48 mb-6 flex items-center justify-center"
                        >
                            <img
                                src="/diwali_realistic.png"
                                alt="Diwali Diya"
                                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,165,0,0.5)]"
                                style={{ mixBlendMode: 'screen' }}
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)] mb-2"
                        >
                            Happy Diwali
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-xl text-yellow-200/80 font-light tracking-widest max-w-lg mx-auto"
                        >
                            May the festival of lights brighten your life.
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DiwaliOverlay;
