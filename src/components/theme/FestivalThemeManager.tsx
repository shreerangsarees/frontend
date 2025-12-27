import React, { useState, useEffect } from 'react';
import MakarSankrantiOverlay from './MakarSankrantiOverlay';
import RepublicDayOverlay from './RepublicDayOverlay';
import GudiPadwaOverlay from './GudiPadwaOverlay';
import RamNavamiOverlay from './RamNavamiOverlay';
import HoliOverlay from './HoliOverlay';
import RakshaBandhanOverlay from './RakshaBandhanOverlay';
import IndependenceDayOverlay from './IndependenceDayOverlay';
import GaneshChaturthiOverlay from './GaneshChaturthiOverlay';
import NavaratriOverlay from './NavaratriOverlay';
import DiwaliOverlay from './DiwaliOverlay';


type FestivalConfig = {
    id: string;
    startDate: { month: number, day: number }; // Month is 0-indexed (0 = Jan)
    endDate: { month: number, day: number };
    Component: React.ComponentType<{ onClose: () => void }>;
};

// Configured for 2025 Calendar
const festivals: FestivalConfig[] = [
    {
        id: 'makar_sankranti',
        startDate: { month: 11, day: 27 }, // Jan 14, 2026
        endDate: { month: 0, day: 18 },   // ~ a few days after (optional range)
        Component: MakarSankrantiOverlay
    },
    {
        id: 'republic_day',
        startDate: { month: 0, day: 26 }, // Jan 26, 2026
        endDate: { month: 0, day: 26 },
        Component: RepublicDayOverlay
    },
    {
        id: 'gudi_padwa',
        startDate: { month: 2, day: 19 }, // Mar 19, 2026 (Ugadi / Gudi Padwa)
        endDate: { month: 2, day: 20 },
        Component: GudiPadwaOverlay
    },
    {
        id: 'holi',
        startDate: { month: 2, day: 3 }, // Mar 3, 2026 (Holika Dahan) – Holi celebrations
        endDate: { month: 2, day: 4 },   // Mar 4, 2026 Holi
        Component: HoliOverlay
    },
    {
        id: 'ram_navami',
        startDate: { month: 2, day: 26 },  // Mar 26, 2026
        endDate: { month: 2, day: 26 },
        Component: RamNavamiOverlay
    },
    {
        id: 'raksha_bandhan',
        startDate: { month: 7, day: 28 },  // Aug 28, 2026
        endDate: { month: 7, day: 28 },
        Component: RakshaBandhanOverlay
    },
    {
        id: 'independence_day',
        startDate: { month: 7, day: 10 }, // Aug 15, 2026
        endDate: { month: 7, day: 15 },
        Component: IndependenceDayOverlay
    },
    {
        id: 'ganesh_chaturthi',
        startDate: { month: 8, day: 5 }, // Sep 14, 2026
        endDate: { month: 8, day: 14 },
        Component: GaneshChaturthiOverlay
    },
    {
        id: 'navaratri',
        startDate: { month: 9, day: 10 }, // Oct 10, 2026 (Navratri start)
        endDate: { month: 9, day: 18 },   // Oct 18 (Navratri end)
        Component: NavaratriOverlay
    },
    {
        id: 'diwali',
        startDate: { month: 10, day: 8 }, // Nov 8, 2026 Diwali
        endDate: { month: 10, day: 10 },  // possible extended range
        Component: DiwaliOverlay
    },

];


const FestivalThemeManager: React.FC = () => {
    const [ActiveFestival, setActiveFestival] = useState<React.ComponentType<{ onClose: () => void }> | null>(null);
    const [festivalId, setFestivalId] = useState<string | null>(null);

    useEffect(() => {
        const checkFestivalDate = () => {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentDay = today.getDate();

            // Find current active festival
            const active = festivals.find(festival => {
                const { startDate, endDate } = festival;

                // Simplified logic assuming festival doesn't span across year boundary
                // Ideally use specific years or moment/date-fns for complex ranges

                if (currentMonth > startDate.month && currentMonth < endDate.month) return true;

                if (currentMonth === startDate.month && currentMonth === endDate.month) {
                    return currentDay >= startDate.day && currentDay <= endDate.day;
                }

                if (currentMonth === startDate.month) {
                    return currentDay >= startDate.day;
                }

                if (currentMonth === endDate.month) {
                    return currentDay <= endDate.day;
                }

                return false;
            });

            // FORCE Override for Testing/Verification (remove in production)
            // Override Logic Removed - Returning active festival based on date
            return active;
        };

        const festival = checkFestivalDate();

        if (festival) {
            const sessionKey = `tmart_theme_seen_${festival.id}_${new Date().getFullYear()}`;
            const hasSeen = sessionStorage.getItem(sessionKey);

            if (!hasSeen) {
                setActiveFestival(() => festival.Component); // Functional update to set component
                setFestivalId(festival.id);
            }
        }
    }, []);

    const handleClose = () => {
        if (festivalId) {
            const sessionKey = `tmart_theme_seen_${festivalId}_${new Date().getFullYear()}`;
            sessionStorage.setItem(sessionKey, 'true');
        }
        setActiveFestival(null);
    };

    if (!ActiveFestival) return null;

    return <ActiveFestival onClose={handleClose} />;
};

export default FestivalThemeManager;
