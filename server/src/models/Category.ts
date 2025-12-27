import { db } from '../config/firebase';

const collection = db.collection('categories');

export interface ICategory {
    _id?: string;
    name: string;
    image: string;
    icon?: string;
    description?: string;
    productCount: number;
    type?: 'regular' | 'occasion'; // Category type: regular for normal categories, occasion for Shop by Occasion
    color?: string; // Gradient color for occasion cards (e.g., "from-red-900 to-rose-800")
    createdAt?: Date;
    updatedAt?: Date;
}

export const Category = {
    async create(data: Omit<ICategory, 'id' | 'createdAt' | 'updatedAt'>) {
        const docRef = collection.doc(); // Auto-ID or could use name as ID slug
        const now = new Date();
        const category: ICategory = {
            _id: docRef.id,
            ...data,
            productCount: 0,
            createdAt: now,
            updatedAt: now
        };
        // Remove undefined values before saving (Firestore doesn't allow undefined)
        const cleanedCategory = Object.fromEntries(
            Object.entries(category).filter(([_, v]) => v !== undefined)
        );
        await docRef.set(cleanedCategory);
        return category;
    },

    async findAll() {
        const snapshot = await collection.get();
        const categories = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() } as any));

        // Sort by createdAt desc (Latest First)
        categories.sort((a, b) => {
            const getMillis = (d: any) => {
                if (!d) return 0;
                if (typeof d.toMillis === 'function') return d.toMillis(); // Firestore Timestamp
                if (d.seconds) return d.seconds * 1000; // Raw Timestamp object
                return new Date(d).getTime(); // Standard Date/String
            };
            return getMillis(b.createdAt) - getMillis(a.createdAt);
        });

        return categories;
    },

    async findById(id: string) {
        const doc = await collection.doc(id).get();
        if (!doc.exists) return null;
        return { _id: doc.id, ...doc.data() } as ICategory;
    },

    async update(id: string, data: Partial<ICategory>) {
        const updateData = { ...data, updatedAt: new Date() };
        await collection.doc(id).update(updateData);
        return this.findById(id);
    },

    async delete(id: string) {
        await collection.doc(id).delete();
        return true;
    }
};
