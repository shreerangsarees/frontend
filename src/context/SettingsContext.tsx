import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
    storeName: string;
    deliveryFee: number;
    minOrderFreeDelivery: number;
    loading: boolean;
}

const defaultSettings: SettingsContextType = {
    storeName: 'Shreerang Saree',
    deliveryFee: 40,
    minOrderFreeDelivery: 499,
    loading: true,
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SettingsContextType>(defaultSettings);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        storeName: data.storeName || 'T-Mart Express',
                        deliveryFee: data.deliveryFee || 40,
                        minOrderFreeDelivery: data.minOrderFreeDelivery || 499,
                        loading: false,
                    });
                } else {
                    setSettings(prev => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
                setSettings(prev => ({ ...prev, loading: false }));
            }
        };
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
};
