import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
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
  | { type: 'REMOVE_ITEM'; payload: { productId: string; selectedColor?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number; selectedColor?: string } }
  | { type: 'UPDATE_ITEM_COLOR'; payload: { productId: string; oldColor: string; newColor: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_COUPON'; payload: { coupon: Coupon; discount: number } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'LOAD_CART'; payload: CartState };

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  return { totalItems, totalAmount };
};

const calculateDiscount = (totalAmount: number, coupon: Coupon | null) => {
  if (!coupon) return 0;
  if (totalAmount < coupon.minOrderValue) return 0;
  if (coupon.discountType === 'percentage') {
    return (totalAmount * coupon.discountAmount) / 100;
  }
  return coupon.discountAmount;
};

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  coupon: null,
  discount: 0,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const product = action.payload;
      const selectedColor = product.selectedColor;

      const existingItemIndex = state.items.findIndex(
        item => item.product.id === product.id && item.selectedColor === selectedColor
      );

      let newItems: CartItem[];

      if (existingItemIndex > -1) {
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
        };
      } else {
        newItems = [...state.items, { product, quantity: 1, selectedColor }];
      }

      const totals = calculateTotals(newItems);
      const discount = calculateDiscount(totals.totalAmount, state.coupon);
      return { ...state, items: newItems, ...totals, discount };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item =>
        !(item.product.id === action.payload.productId && item.selectedColor === action.payload.selectedColor)
      );
      const totals = calculateTotals(newItems);
      const discount = calculateDiscount(totals.totalAmount, state.coupon);
      return { ...state, items: newItems, ...totals, discount };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity, selectedColor } = action.payload;

      // If quantity is 0 or less, remove the item
      if (quantity <= 0) {
        const newItems = state.items.filter(item =>
          !(item.product.id === productId && item.selectedColor === selectedColor)
        );
        const totals = calculateTotals(newItems);
        const discount = calculateDiscount(totals.totalAmount, state.coupon);
        return { ...state, items: newItems, ...totals, discount };
      }

      const newItems = state.items.map(item => {
        if (item.product.id === productId && item.selectedColor === selectedColor) {
          return { ...item, quantity };
        }
        return item;
      });

      const totals = calculateTotals(newItems);
      const discount = calculateDiscount(totals.totalAmount, state.coupon);
      return { ...state, items: newItems, ...totals, discount };
    }

    case 'UPDATE_ITEM_COLOR': {
      const { productId, oldColor, newColor } = action.payload;

      if (oldColor === newColor) return state;

      // Find the item to update
      const itemIndex = state.items.findIndex(
        item => item.product.id === productId && item.selectedColor === oldColor
      );

      if (itemIndex === -1) return state; // Item not found

      const itemToUpdate = state.items[itemIndex];

      // Check if an item with the NEW color already exists
      const existingTargetIndex = state.items.findIndex(
        item => item.product.id === productId && item.selectedColor === newColor
      );

      let newItems = [...state.items];

      if (existingTargetIndex > -1) {
        // Target color already exists, merge them
        newItems[existingTargetIndex] = {
          ...newItems[existingTargetIndex],
          quantity: newItems[existingTargetIndex].quantity + itemToUpdate.quantity
        };
        // Remove the old item
        newItems.splice(itemIndex, 1);
      } else {
        // Just update the color of the existing item
        newItems[itemIndex] = {
          ...itemToUpdate,
          selectedColor: newColor
        };
      }

      const totals = calculateTotals(newItems);
      const discount = calculateDiscount(totals.totalAmount, state.coupon);
      return { ...state, items: newItems, ...totals, discount };
    }

    case 'CLEAR_CART':
      return initialState;

    case 'APPLY_COUPON':
      return {
        ...state,
        coupon: action.payload.coupon,
        discount: action.payload.discount,
      };

    case 'REMOVE_COUPON':
      return {
        ...state,
        coupon: null,
        discount: 0,
      };

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
};

interface CartContextType extends CartState {
  addItem: (product: Product) => boolean;
  removeItem: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => boolean;
  updateItemColor: (productId: string, oldColor: string, newColor: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, selectedColor?: string) => number;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Recalculate totals and discount to ensure consistency
        const totals = calculateTotals(parsedCart.items || []);
        const discount = calculateDiscount(totals.totalAmount, parsedCart.coupon);

        dispatch({
          type: 'LOAD_CART',
          payload: {
            items: parsedCart.items || [],
            totalItems: totals.totalItems,
            totalAmount: totals.totalAmount,
            coupon: parsedCart.coupon || null,
            discount: discount,
          },
        });
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const addItem = (product: Product): boolean => {
    // Calculate total quantity of this product in cart (across all variants)
    const totalProductQty = state.items
      .filter(item => item.product.id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (totalProductQty + 1 > product.stock) {
      toast.error(`You can't add more. Only ${product.stock} left in stock`);
      return false;
    }

    // Check maximum quantity per item limit
    const MAX_QTY = 10;
    if (totalProductQty + 1 > MAX_QTY) {
      toast.error(`Maximum ${MAX_QTY} items allowed per product`);
      return false;
    }

    dispatch({ type: 'ADD_ITEM', payload: product });
    toast.success('Item added to cart');
    return true;
  };

  const removeItem = (productId: string, selectedColor?: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, selectedColor } });
    toast.info('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number, selectedColor?: string): boolean => {
    const item = state.items.find(
      i => i.product.id === productId && i.selectedColor === selectedColor
    );

    if (item && quantity > item.quantity) {
      // Calculate total quantity of this product (excluding current item's old amount + new amount)
      // Actually simpler: Total other variants + new quantity
      const otherVariantsQty = state.items
        .filter(i => i.product.id === productId && i.selectedColor !== selectedColor)
        .reduce((sum, i) => sum + i.quantity, 0);

      if (otherVariantsQty + quantity > item.product.stock) {
        toast.error(`You can't add more. Only ${item.product.stock} left in stock`);
        return false;
      }
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity, selectedColor } });
    return true;
  };

  const updateItemColor = (productId: string, oldColor: string, newColor: string) => {
    dispatch({ type: 'UPDATE_ITEM_COLOR', payload: { productId, oldColor, newColor } });
    toast.success('Item color updated');
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.info('Cart cleared');
  };

  const getItemQuantity = (productId: string, selectedColor?: string): number => {
    if (selectedColor === undefined) {
      return state.items
        .filter(i => i.product.id === productId)
        .reduce((sum, i) => sum + i.quantity, 0);
    }
    const item = state.items.find(
      i => i.product.id === productId && i.selectedColor === selectedColor
    );
    return item ? item.quantity : 0;
  };

  const applyCoupon = (coupon: Coupon) => {
    const discount = calculateDiscount(state.totalAmount, coupon);
    dispatch({ type: 'APPLY_COUPON', payload: { coupon, discount } });
    toast.success('Coupon applied successfully');
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
    toast.info('Coupon removed');
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        updateItemColor,
        clearCart,
        getItemQuantity,
        applyCoupon,
        removeCoupon,
        isLoaded,
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

// Maximum quantity per item to prevent abuse
export const MAX_QUANTITY_PER_ITEM = 10;
