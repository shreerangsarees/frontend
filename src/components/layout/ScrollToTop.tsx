import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    // Use useLayoutEffect to scroll before browser paint
    useLayoutEffect(() => {
        // Scroll to top immediately
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        // Also reset scroll on the document element for compatibility
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [pathname]);

    return null;
};

export default ScrollToTop;

