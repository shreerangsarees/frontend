import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RepublicDayOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [stage, setStage] = useState<'enter' | 'active' | 'exit'>('enter');

    useEffect(() => {
        // Auto close after 5s
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
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white/95"
                >
                    {/* Tri-color Background Gradient - Subtle */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-green-50 opacity-90" />

                    {/* Top Right Skip */}
                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full z-50">
                        <X className="h-6 w-6" />
                    </button>

                    {/* Ashoka Chakra Rotating Background */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[600px] h-[600px] border-4 border-blue-800/10 rounded-full flex items-center justify-center opacity-10"
                    >
                        {/* Spokes */}
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="absolute w-[1px] h-full bg-blue-800/20" style={{ transform: `rotate(${i * 15}deg)` }} />
                        ))}
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="relative z-10 text-center"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-blue-900 to-green-600 drop-shadow-sm pb-2">
                            Happy Republic Day
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-900 mt-4 font-serif tracking-widest uppercase">
                            Vande Mataram
                        </p>

                        {/* Animated Tricolor Ribbons/Confetti */}
                        <div className="absolute -top-20 left-0 w-full h-[300px] pointer-events-none">
                            {[...Array(15)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: -100, x: Math.random() * 500 - 250, opacity: 0 }}
                                    animate={{ y: 300, rotate: Math.random() * 360, opacity: [0, 1, 0] }}
                                    transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
                                    className={`absolute w-3 h-3 rounded-full ${i % 3 === 0 ? 'bg-orange-500' : i % 3 === 1 ? 'bg-white border border-gray-200' : 'bg-green-600'}`}
                                    style={{ left: '50%' }}
                                />
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RepublicDayOverlay;
