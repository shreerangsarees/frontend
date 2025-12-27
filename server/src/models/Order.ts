import { db } from '../config/firebase';

const collection = db.collection('orders');

export interface IOrder {
    _id?: string;
    user: string; // User UID
    items: {
        product: string; // Product ID
        name: string; // Snapshot
        image: string; // Snapshot
        quantity: number;
        price: number;
        selectedColor?: string;
    }[];
    totalAmount: number;
    discount?: number;
    shippingAddress: {
        label: string;
        full_address: string;
        city: string;
        pincode: string;
        phone?: string;
    };
    paymentMethod: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Return Requested' | 'Replacement Requested' | 'Returned';
    paymentInfo?: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
    };
    paymentStatus?: string;
    deliveryFee?: number;
    cancellationReason?: string;
    cancelledAt?: Date;
    // Return fields
    returnReason?: string;
    returnRequestedAt?: Date;
    returnItems?: string[];
    returnProcessedAt?: Date;
    returnRejectedAt?: Date;
    returnRejectionReason?: string;
    refundAmount?: number;
    refundStatus?: 'not_initiated' | 'processing' | 'completed' | 'failed';
    refundedAt?: Date;
    requestType?: 'return' | 'replace';
    createdAt?: Date;
    updatedAt?: Date;
}

// Helper to convert Firestore Timestamps to Dates
const convertDates = (data: any): any => {
    if (!data) return data;
    const newData = { ...data };

    // List of date fields to check
    const dateFields = [
        'createdAt', 'updatedAt', 'cancelledAt',
        'returnRequestedAt', 'returnProcessedAt',
        'returnRejectedAt', 'refundedAt'
    ];

    dateFields.forEach(field => {
        if (newData[field] && typeof newData[field].toDate === 'function') {
            newData[field] = newData[field].toDate();
        } else if (newData[field] && typeof newData[field] === 'string') {
            // Try parsing string dates if they exist
            const d = new Date(newData[field]);
            if (!isNaN(d.getTime())) newData[field] = d;
        }
    });

    return newData;
};

export const Order = {
    async create(data: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
        const docRef = collection.doc();
        const now = new Date();
        const order: IOrder = {
            _id: docRef.id,
            ...data,
            status: 'Pending',
            createdAt: now,
            updatedAt: now
        };
        await docRef.set(order);
        return order;
    },

    async findAll() {
        const snapshot = await collection.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({
            _id: doc.id,
            ...convertDates(doc.data())
        }));
    },

    async findByUser(userId: string) {
        const snapshot = await collection.where('user', '==', userId).get();
        const orders = snapshot.docs.map(doc => ({
            _id: doc.id,
            ...convertDates(doc.data())
        } as IOrder));

        // Sort in memory
        return orders.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
    },

    async countByUser(userId: string) {
        const snapshot = await collection.where('user', '==', userId).count().get();
        return snapshot.data().count;
    },

    async findById(id: string) {
        const doc = await collection.doc(id).get();
        if (!doc.exists) return null;
        return {
            _id: doc.id,
            ...convertDates(doc.data())
        } as IOrder;
    },

    async update(id: string, data: Partial<IOrder>) {
        const updateData = { ...data, updatedAt: new Date() };
        await collection.doc(id).update(updateData);
        // Return updated doc with converted dates
        const updatedDoc = await collection.doc(id).get();
        return { _id: updatedDoc.id, ...convertDates(updatedDoc.data()) } as IOrder;
    },

    // For admin dashboard - complex queries might need indexes
    async findByStatus(statuses: string[]) {
        const snapshot = await collection.where('status', 'in', statuses).orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({
            _id: doc.id,
            ...convertDates(doc.data())
        }));
    },

    async delete(id: string) {
        await collection.doc(id).delete();
        return true;
    }
};
