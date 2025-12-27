import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface FadeInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    fullWidth?: boolean;
    threshold?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({
    children,
    className,
    delay = 0,
    direction = 'up',
    fullWidth = false,
    threshold = 0.1
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Once visible, we can stop observing to keep it visible
                    if (domRef.current) observer.unobserve(domRef.current);
                }
            });
        }, { threshold });

        const currentRef = domRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [threshold]);

    const getDirectionClass = () => {
        if (isVisible) return 'translate-x-0 translate-y-0 opacity-100';

        switch (direction) {
            case 'up': return 'translate-y-8 opacity-0';
            case 'down': return '-translate-y-8 opacity-0';
            case 'left': return 'translate-x-8 opacity-0';
            case 'right': return '-translate-x-8 opacity-0';
            case 'none': return 'opacity-0';
            default: return 'translate-y-8 opacity-0';
        }
    };

    return (
        <div
            ref={domRef}
            className={cn(
                "transition-all duration-700 ease-out will-change-[transform,opacity]",
                getDirectionClass(),
                fullWidth ? "w-full" : "",
                className
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};
