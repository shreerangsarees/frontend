import { db } from '../config/firebase';

const collection = db.collection('coupons');

export interface ICoupon {
    id?: string;
    code: string;
    discountType: 'percentage' | 'flat';
    discountAmount: number;
    minOrderValue: number;
    expiryDate: Date; // Store as string in Firestore usually, or Timestamp
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export const Coupon = {
    async create(data: Omit<ICoupon, 'id' | 'createdAt' | 'updatedAt'>) {
        const docRef = collection.doc();
        const now = new Date();
        const coupon: ICoupon = {
            id: docRef.id,
            ...data,
            code: data.code.toUpperCase(),
            minOrderValue: data.minOrderValue || 0,
            isActive: data.isActive ?? true,
            createdAt: now,
            updatedAt: now
        };
        await docRef.set(coupon);
        return coupon;
    },

    async findAll() {
        const snapshot = await collection.get();
        // Sort desc in memory
        const coupons = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
                _id: doc.id,
                ...d,
                expiryDate: (d.expiryDate as any).toDate ? (d.expiryDate as any).toDate() : d.expiryDate
            } as any;
        });

        coupons.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        return coupons;
    },

    async findByCode(code: string) {
        // Firestore is case sensitive, but we save as UPPERCASE
        const snapshot = await collection.where('code', '==', code.toUpperCase()).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        const d = doc.data();
        return {
            id: doc.id,
            ...d,
            expiryDate: (d.expiryDate as any).toDate ? (d.expiryDate as any).toDate() : d.expiryDate
        } as ICoupon;
    },

    async findById(id: string) {
        const doc = await collection.doc(id).get();
        if (!doc.exists) return null;
        const d = doc.data() as any;
        return {
            id: doc.id,
            ...d,
            expiryDate: d.expiryDate?.toDate ? d.expiryDate.toDate() : d.expiryDate
        } as ICoupon;
    },

    async update(id: string, data: Partial<ICoupon>) {
        const updateData: any = { ...data, updatedAt: new Date() };
        if (data.code) updateData.code = data.code.toUpperCase();
        await collection.doc(id).update(updateData);
        return this.findById(id);
    },

    async delete(id: string) {
        await collection.doc(id).delete();
        return true;
    }
};
