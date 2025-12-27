import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GaneshChaturthiOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-orange-50/95"
                >
                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 z-50 text-orange-800 hover:bg-orange-200/50 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>

                    <div className="relative z-10 text-center">
                        {/* Realistic Ganesha Image */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="w-48 h-64 mx-auto mb-6 relative flex items-center justify-center"
                        >
                            <img
                                src="/ganpati_realistic.png"
                                alt="Lord Ganesha"
                                className="w-full h-full object-contain drop-shadow-xl mix-blend-multiply"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="text-5xl md:text-7xl font-bold text-orange-800 mb-2 drop-shadow-sm"
                        >
                            Ganpati Bappa Morya!
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-xl text-orange-700 max-w-lg mx-auto"
                        >
                            May Lord Ganesha bless you with happiness and prosperity.
                        </motion.p>

                        {/* Floating Modaks */}
                        {[...Array(5)].map((_, i) => (

                            <motion.div
                                key={i}
                                initial={{ y: 200, opacity: 0 }}
                                animate={{ y: -50, opacity: [0, 1, 0] }}
                                transition={{ delay: 1 + (i * 0.5), duration: 4, repeat: Infinity, repeatDelay: 1 }}
                                className="absolute w-12 h-12"
                                style={{ left: `${20 + (i * 15)}%`, bottom: 0 }}
                            >
                                <img
                                    src="/modak_realistic.png"
                                    alt="Modak"
                                    className="w-full h-full object-contain drop-shadow-md mix-blend-multiply"
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GaneshChaturthiOverlay;
