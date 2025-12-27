import { db } from '../config/firebase'; // Admin SDK
import { UserRecord } from 'firebase-admin/auth';

const collection = db.collection('users');

export interface IUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'customer' | 'admin' | 'delivery';
    createdAt: Date;
    addresses?: any[];
    wishlist?: string[];
    fcmTokens?: string[];
}

export const User = {
    async create(userAuth: UserRecord | any, additionalData: any = {}) {
        const userRef = collection.doc(userAuth.uid);
        const snapshot = await userRef.get();

        if (!snapshot.exists) {
            const newUser: IUser = {
                uid: userAuth.uid,
                email: userAuth.email || '',
                displayName: userAuth.displayName || additionalData.name || '',
                photoURL: userAuth.photoURL || '',
                role: 'customer',
                createdAt: new Date(),
                addresses: [],
                wishlist: [],
                fcmTokens: [],
                ...additionalData
            };

            await userRef.set(newUser);
            return newUser;
        } else {
            // User exists - Sync basic info (Name, Photo) if provided
            // We use merge to avoid overwriting sensitive fields like addresses/wishlist
            const updates: any = {};
            if (userAuth.displayName) updates.displayName = userAuth.displayName;
            if (userAuth.photoURL) updates.photoURL = userAuth.photoURL;
            // Also update from additionalData if meaningful? default to keeping existing unless Auth provider is authority.

            if (Object.keys(updates).length > 0) {
                await userRef.set(updates, { merge: true });
            }

            // Return FRESH data to ensure we have latest addresses/wishlist
            const updatedSnapshot = await userRef.get();
            return updatedSnapshot.data() as IUser;
        }
    },

    async findById(uid: string) {
        const doc = await collection.doc(uid).get();
        if (doc.exists) {
            return doc.data() as IUser;
        }
        return null;
    },

    async update(uid: string, data: Partial<IUser>) {
        await collection.doc(uid).set(data, { merge: true });
        return await this.findById(uid);
    }
};
