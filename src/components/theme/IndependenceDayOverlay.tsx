import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IndependenceDayOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white/95"
                >
                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 z-50 text-gray-800 hover:bg-gray-100/50 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>

                    {/* Gradient Backgrounds */}
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-orange-500/10" />
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-green-600/10" />

                    <div className="relative z-10 text-center">
                        <motion.h1
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-blue-900 to-green-600 drop-shadow-lg mb-4"
                        >
                            Independence Day
                        </motion.h1>

                        {/* Ashoka Chakra */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 1.5, type: 'spring' }}
                            className="w-32 h-32 mx-auto my-6 border-4 border-blue-900 rounded-full flex items-center justify-center relative"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                                className="w-full h-full rounded-full absolute"
                            >
                                {[...Array(24)].map((_, i) => (
                                    <div key={i} className="absolute w-[1px] h-1/2 bg-blue-900 left-1/2 top-0 origin-bottom" style={{ transform: `translateX(-50%) rotate(${i * 15}deg)` }} />
                                ))}
                            </motion.div>
                            <div className="w-4 h-4 bg-blue-900 rounded-full z-10" />
                        </motion.div>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-2xl text-blue-950 font-serif tracking-widest uppercase"
                        >
                            Jai Hind
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IndependenceDayOverlay;
