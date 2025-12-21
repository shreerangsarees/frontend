export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  stock: number;
  isAvailable: boolean;
  isNew?: boolean;
  discount?: number;
  rating?: number;
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
}

export interface Address {
  _id?: string;
  id?: string;
  label: string;
  full_address: string;
  city: string;
  pincode: string;
  is_default: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: 'customer' | 'admin' | 'delivery';
  addresses: Address[];
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
}

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

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
