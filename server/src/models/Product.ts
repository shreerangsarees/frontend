import { db } from '../config/firebase';

const collection = db.collection('products');

// Simplified Interface excluding Document methods
export interface IProduct {
    id?: string;
    name: string;
    description: string;
    price: number;
    original_price?: number;
    discount?: number;
    is_new?: boolean;
    category: string; // Primary category (for backwards compatibility)
    categories?: string[]; // Multiple categories
    image: string;
    images?: string[];
    colors?: string[]; // Available colors (e.g., ["Red", "Maroon", "Golden"])
    stock: number;
    unit: string;
    isAvailable: boolean;
    salesCount: number;
    rating: number;
    reviewCount: number;
    averageRating: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export const Product = {
    async create(data: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>) {
        const docRef = collection.doc();
        const now = new Date();
        const product: IProduct = {
            id: docRef.id,
            ...data,
            createdAt: now,
            updatedAt: now,
            // Defaults
            discount: data.discount || 0,
            is_new: data.is_new || false,
            stock: data.stock !== undefined ? data.stock : 10,
            isAvailable: data.isAvailable ?? true,
            salesCount: 0,
            rating: 0,
            reviewCount: 0,
            averageRating: 0
        };
        await docRef.set(product);
        return product;
    },

    async findAll() {
        const snapshot = await collection.get();
        return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    },

    async findById(id: string) {
        const doc = await collection.doc(id).get();
        if (!doc.exists) return null;
        return { _id: doc.id, ...doc.data() } as any;
    },

    async update(id: string, data: Partial<IProduct>) {
        const updateData = { ...data, updatedAt: new Date() };
        await collection.doc(id).update(updateData);
        return this.findById(id);
    },

    async delete(id: string) {
        await collection.doc(id).delete();
        return true;
    },

    async findByCategory(category: string) {
        const snapshot = await collection.where('category', '==', category).get();
        return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    }
};
