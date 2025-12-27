import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RamNavamiOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
                    <button onClick={handleClose} className="absolute top-4 right-4 p-2 z-50 text-orange-800 hover:bg-orange-200/50 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>



                    <div className="relative z-10 text-center px-6 border-4 border-orange-500/30 p-10 rounded-3xl bg-white/40 backdrop-blur-sm">

                        {/* Lord Ram Image */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="w-48 h-64 mx-auto mb-6 relative"
                        >
                            <img
                                src="/lord_ram_arrow.png"
                                alt="Lord Ram"
                                className="w-full h-full object-contain filter drop-shadow-xl mix-blend-multiply"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-7xl font-bold text-orange-700 drop-shadow-md mb-2"
                        >
                            Happy Ram Navami
                        </motion.h1>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto mt-4 mb-4"
                        />

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-xl text-orange-800 font-medium"
                        >
                            Jai Shree Ram
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RamNavamiOverlay;
