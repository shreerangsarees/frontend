import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RakshaBandhanOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-rose-50/95"
                >
                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 z-50 text-rose-800 hover:bg-rose-200/50 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>

                    <div className="relative z-10 text-center w-full max-w-4xl p-10">
                        {/* Realistic Rakhi Image */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', bounce: 0.5, duration: 1.5 }}
                            className="relative w-full max-w-lg mx-auto mb-6 h-64 flex items-center justify-center"
                        >
                            <img
                                src="/rakhi_realistic.png"
                                alt="Raksha Bandhan Rakhi"
                                className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-5xl md:text-7xl font-bold text-rose-600 drop-shadow-sm font-serif mb-4"
                        >
                            Happy Raksha Bandhan
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-xl text-rose-800"
                        >
                            Celebrating the bond of love and protection.
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RakshaBandhanOverlay;
