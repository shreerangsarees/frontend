import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NavaratriOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-fuchsia-950/95"
                >
                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 z-50 text-white hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>

                    {/* Nine Colors Background Animation */}
                    <div className="absolute inset-0 opacity-20">
                        <motion.div
                            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-[length:200%_200%]"
                        />
                    </div>

                    <div className="relative z-10 text-center">
                        {/* Dandiya Sticks Cross */}
                        {/* Realistic Dandiya Couple Image */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="w-64 h-64 mx-auto mb-6 relative flex items-center justify-center"
                        >
                            <img
                                src="/navaratri_couple.png"
                                alt="Navaratri Dandiya"
                                className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 drop-shadow-lg mb-4"
                        >
                            Happy Navaratri
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-xl text-fuchsia-200 font-medium"
                        >
                            Celebrating the 9 nights of devotion and dance.
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NavaratriOverlay;
