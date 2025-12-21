import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signIn: () => void;
    signOut: () => void;
    profile: User | null;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await fetch('/auth/current_user', {
                credentials: 'include' // Important for session cookies
            });
            if (res.ok) {
                const data = await res.json();
                // If data is empty or not authorized, it might return empty body or 401.
                // Passport strategies usually return the user object if authenticated.
                if (data && data._id) {
                    setUser({
                        id: data._id,
                        name: data.name,
                        email: data.email,
                        avatar: data.avatar,
                        role: data.role,
                        addresses: data.addresses || []
                    });
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            //   console.error('Error fetching user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const signIn = () => {
        // For specific providers, we might need arguments, but usually we just redirect.
        // This function might be less useful if we use direct links.
        // We'll keep it for interface compatibility or future use.
    };

    const signOut = async () => {
        window.location.href = '/auth/logout';
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut, profile: user, refreshProfile: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
