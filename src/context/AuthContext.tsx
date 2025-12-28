import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as UserType } from '@/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import axios from 'axios';
import { toast } from 'sonner';

interface AuthContextType {
    user: UserType | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);

    const syncUserWithBackend = async (firebaseUser: FirebaseUser) => {
        try {
            const token = await firebaseUser.getIdToken();
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Sync user to DB
            const { data } = await axios.post(`${API_URL}/users/sync`, {
                name: firebaseUser.displayName,
                email: firebaseUser.email,
                picture: firebaseUser.photoURL
            }, config);

            // console.log("AuthContext Sync Response:", data);

            // Fetch latest profile including role
            // The sync response might already be enough, but let's map it correctly
            setUser({
                id: firebaseUser.uid,
                name: data.displayName || firebaseUser.displayName || 'User',
                email: data.email || firebaseUser.email || '',
                avatar: data.photoURL || firebaseUser.photoURL || '',
                photoURL: data.photoURL || firebaseUser.photoURL || '',
                role: data.role || 'customer',
                addresses: data.addresses || [],
                wishlist: data.wishlist || []
            });

            localStorage.setItem('tmart_token', token);

        } catch (error: any) {
            console.error("Sync Error", error);
            const targetUrl = `${API_URL}/users/sync`;
            toast.error(`Sync Failed accessing ${targetUrl}: ${error.message}`);

            // If we already have user data, don't wipe it out on a sync error
            // This prevents the UI from flashing empty states if the backend is temporarily unreachable
            setUser(prevUser => {
                if (prevUser) return prevUser;

                // Only use fallback if we have no user data at all
                return {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'User',
                    email: firebaseUser.email || '',
                    avatar: firebaseUser.photoURL || '',
                    photoURL: firebaseUser.photoURL || '',
                    role: 'customer',
                    addresses: [],
                    wishlist: []
                };
            });
            localStorage.setItem('tmart_token', await firebaseUser.getIdToken());
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                await syncUserWithBackend(currentUser);
            } else {
                setUser(null);
                localStorage.removeItem('tmart_token');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            localStorage.removeItem('tmart_token');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Manual refresh to get latest data (e.g. after address update)
    const refreshProfile = async () => {
        if (auth.currentUser) {
            await syncUserWithBackend(auth.currentUser);
        }
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, signOut, refreshProfile }}>
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
