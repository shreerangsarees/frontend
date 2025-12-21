import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, Product, Coupon } from '@/types';
import { toast } from 'sonner';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  coupon: Coupon | null;
  discount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'APPLY_COUPON'; payload: { coupon: Coupon; discount: number } }
  | { type: 'REMOVE_COUPON' };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  coupon: null,
  discount: 0,
};

const calculateTotals = (items: CartItem[]): { totalItems: number; totalAmount: number } => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return { totalItems, totalAmount };
};

const calculateDiscount = (totalAmount: number, coupon: Coupon | null): number => {
  if (!coupon) return 0;
  if (totalAmount < coupon.minOrderValue) return 0;

  if (coupon.discountType === 'flat') {
    return coupon.discountAmount;
  } else {
    return Math.round((totalAmount * coupon.discountAmount) / 100);
  }
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[];

  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.product.id === action.payload.id);
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { product: action.payload, quantity: 1 }];
      }
      const totals = calculateTotals(newItems);
      // Recalculate discount if coupon exists
      const discount = calculateDiscount(totals.totalAmount, state.coupon);
      return { items: newItems, ...totals, coupon: state.coupon, discount };
    }

    case 'REMOVE_ITEM': {
      newItems = state.items.filter(item => item.product.id !== action.payload);
      const totals = calculateTotals(newItems);
      const discount = calculateDiscount(totals.totalAmount, state.coupon);
      return { items: newItems, ...totals, coupon: state.coupon, discount };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        newItems = state.items.filter(item => item.product.id !== action.payload.productId);
      } else {
        newItems = state.items.map(item =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        );
      }
      const totals = calculateTotals(newItems);
      const discount = calculateDiscount(totals.totalAmount, state.coupon);
      return { items: newItems, ...totals, coupon: state.coupon, discount };
    }

    case 'CLEAR_CART':
      return initialState;

    case 'LOAD_CART': {
      const totals = calculateTotals(action.payload);
      return { items: action.payload, ...totals, coupon: null, discount: 0 };
    }

    case 'APPLY_COUPON':
      return { ...state, coupon: action.payload.coupon, discount: action.payload.discount };

    case 'REMOVE_COUPON':
      return { ...state, coupon: null, discount: 0 };

    default:
      return state;
  }
};

interface CartContextType extends CartState {
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('tmart-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('tmart-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
    toast.success(`${product.name} added to cart`, {
      description: `₹${product.price} × 1`,
      duration: 2000,
    });
  };

  const removeItem = (productId: string) => {
    const item = state.items.find(i => i.product.id === productId);
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    if (item) {
      toast.info(`${item.product.name} removed from cart`, { duration: 2000 });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.info('Cart cleared', { duration: 2000 });
  };

  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const applyCoupon = (coupon: Coupon) => {
    const discount = calculateDiscount(state.totalAmount, coupon);
    dispatch({ type: 'APPLY_COUPON', payload: { coupon, discount } });
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
