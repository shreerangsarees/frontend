import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HoliOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white"
                >
                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 z-50 bg-white/20 hover:bg-white/40 rounded-full">
                        <X className="h-6 w-6 text-gray-800" />
                    </button>

                    {/* Colorful Splashes */}
                    <div className="absolute inset-0 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.8 }} transition={{ duration: 0.8 }}
                            className="absolute top-0 left-0 w-[400px] h-[400px] bg-pink-500 rounded-full blur-[80px] mix-blend-multiply opacity-70"
                        />
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.8 }} transition={{ duration: 0.8, delay: 0.2 }}
                            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-400 rounded-full blur-[80px] mix-blend-multiply opacity-70"
                        />
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.8 }} transition={{ duration: 0.8, delay: 0.4 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500 rounded-full blur-[80px] mix-blend-multiply opacity-60"
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center">
                        <motion.h1
                            initial={{ scale: 0.5, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-lg"
                        >
                            Happy Holi!
                        </motion.h1>
                        <p className="text-xl text-gray-700 mt-4 font-medium">May your life be as colorful as this festival.</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HoliOverlay; // Re-export for TS indexing 
