export interface Product {
  _id?: string;
  id: string; // Keep for compatibility if frontend maps _id to id
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  original_price?: number; // Backend field
  image: string;
  category: string;
  categories?: string[]; // Multiple categories
  colors?: string[]; // Available color options
  selectedColor?: string; // Customer-selected color
  stock: number;
  isAvailable: boolean;
  is_available?: boolean; // Backend field
  isNew?: boolean;
  is_new?: boolean; // Backend field
  discount?: number;
  rating?: number;
  averageRating?: number; // Backend aggregate field
  unit?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string; // Customer-selected color for this item
}

export interface Address {
  _id?: string;
  id?: string;
  label: string;
  full_address: string;
  city: string;
  pincode: string;
  is_default: boolean;
  // Optional fields for Profile/Edit granularity
  street?: string;
  state?: string;
  zip?: string;
  phone?: string;
  country?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  photoURL?: string; // Mapped from Firebase or backend
  role?: 'customer' | 'admin' | 'delivery';
  addresses: Address[];
  wishlist?: any[];
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryAddress: Address;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  deliveryFee: number;
  estimatedDelivery?: string;
  refundStatus?: 'not_initiated' | 'processing' | 'completed' | 'failed';
  refundedAt?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested'
  | 'Replacement Requested'
  | 'Returned';

export type PaymentMethod = 'cod' | 'card' | 'upi';

export interface StoreInfo {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  deliveryRadius: number; // in km
  deliveryFee: number;
  minOrder: number;
  estimatedDeliveryTime: string;
  isOpen: boolean;
  openingHours: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountAmount: number;
  minOrderValue: number;
  _id?: string;
}
