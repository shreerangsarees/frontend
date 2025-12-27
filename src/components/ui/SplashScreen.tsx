
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onComplete }: { onComplete?: () => void }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: '#8c0e28' }}
                >
                    <img
                        src="/splashscreen.gif"
                        alt="Loading..."
                        className="max-w-[80%] max-h-[80%] object-contain"
                        style={{
                            maskImage: 'radial-gradient(circle, black 60%, transparent 100%)',
                            WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 100%)'
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
