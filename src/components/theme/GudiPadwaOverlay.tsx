import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GudiPadwaOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#FFF8E1]" // Warmer, cleaner cream background
                >
                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 z-50 text-orange-800 hover:bg-orange-100 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>

                    {/* Decorative Background Pattern (Subtle) */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #FFA000 1px, transparent 0)', backgroundSize: '40px 40px' }}
                    />

                    {/* Mango Leaves Toran (Top Decoration) */}
                    <div className="absolute top-0 left-0 w-full flex justify-between pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: -10, opacity: 1 }}
                                transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                                className="w-16 h-24 md:w-20 md:h-32 -mt-4 origin-top"
                            >
                                <img
                                    src="/mango_leaf.png"
                                    alt="Mango Leaf"
                                    className="w-full h-full object-contain filter drop-shadow-lg"
                                />
                            </motion.div>
                        ))}
                    </div>

                    <div className="relative z-10 text-center flex flex-col items-center p-8">

                        {/* High Fidelity Gudi Image */}
                        <motion.div
                            initial={{ scale: 0.8, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative w-64 h-96 mb-6"
                        >
                            <img
                                src="/gudi_padwa.png"
                                alt="Gudi Padwa"
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-700 to-orange-600 drop-shadow-sm mb-3"
                            style={{ fontFamily: 'serif' }}
                        >
                            Happy Gudi Padwa
                        </motion.h1>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "120px" }}
                            transition={{ delay: 0.7, duration: 1 }}
                            className="h-1 bg-orange-400 rounded-full mb-4"
                        />

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-xl text-amber-900 font-medium tracking-wide"
                        >
                            May the New Year bring you health, wealth, and prosperity.
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GudiPadwaOverlay;
