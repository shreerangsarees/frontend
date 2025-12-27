import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface OrderItem {
    product: {
        _id: string;
        name: string;
        price: number;
        image: string;
        category: string;
        description?: string;
        stock: number;
    };
    quantity: number;
}

export function useReorder() {
    const { addItem } = useCart();

    const reorderItems = (items: OrderItem[]) => {
        let addedCount = 0;
        let outOfStockCount = 0;

        items.forEach(item => {
            if (item.product && item.product.stock > 0) {
                // Add each item with its original quantity (or max available stock)
                const quantityToAdd = Math.min(item.quantity, item.product.stock);
                for (let i = 0; i < quantityToAdd; i++) {
                    addItem({
                        id: item.product._id,
                        name: item.product.name,
                        price: item.product.price,
                        image: item.product.image,
                        category: item.product.category,
                        description: item.product.description || '',
                        stock: item.product.stock,
                        isAvailable: true
                    });
                }
                addedCount++;
            } else {
                outOfStockCount++;
            }
        });

        if (addedCount > 0 && outOfStockCount === 0) {
            toast.success(`Added ${addedCount} items to cart`);
        } else if (addedCount > 0 && outOfStockCount > 0) {
            toast.success(`Added ${addedCount} items to cart (${outOfStockCount} items were out of stock)`);
        } else if (outOfStockCount > 0) {
            toast.error('All items from this order are out of stock');
        }

        return addedCount > 0;
    };

    return { reorderItems };
}
