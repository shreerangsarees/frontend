import React, { useState, useEffect } from 'react';
import { Tag, Percent, Loader2, X, Save, Plus } from 'lucide-react';
import { API_BASE_URL } from '@/apiConfig';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Product {
    _id: string;
    name: string;
    price: number;
    original_price?: number;
    discount?: number;
    is_new?: boolean;
    image: string;
    category: string;
}

const AdminOffers: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [discountValue, setDiscountValue] = useState<string>('');
    const [originalPrice, setOriginalPrice] = useState<string>('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`${API_BASE_URL}/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (product: Product) => {
        setEditingProduct(product._id);
        setDiscountValue(product.discount ? String(product.discount) : '');
        setOriginalPrice(product.original_price ? String(product.original_price) : String(product.price));
    };

    const cancelEditing = () => {
        setEditingProduct(null);
        setDiscountValue('');
        setOriginalPrice('');
    };

    const saveOffer = async (productId: string, currentPrice: number) => {
        const discountNum = Number(discountValue) || 0;
        const originalPriceNum = Number(originalPrice) || 0;

        setSaving(productId);
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    discount: discountNum,
                    original_price: originalPriceNum > currentPrice ? originalPriceNum : null
                })
            });

            if (res.ok) {
                toast.success('Offer updated successfully!');
                fetchProducts();
                cancelEditing();
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            toast.error('Failed to update offer');
        } finally {
            setSaving(null);
        }
    };

    const removeOffer = async (productId: string) => {
        setSaving(productId);
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    discount: 0,
                    original_price: null
                })
            });

            if (res.ok) {
                toast.success('Offer removed!');
                fetchProducts();
            } else {
                throw new Error('Failed to remove');
            }
        } catch (error) {
            toast.error('Failed to remove offer');
        } finally {
            setSaving(null);
        }
    };

    const toggleNew = async (productId: string, currentIsNew: boolean) => {
        setSaving(productId);
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    is_new: !currentIsNew
                })
            });

            if (res.ok) {
                toast.success(currentIsNew ? 'Removed NEW badge' : 'Added NEW badge');
                fetchProducts();
            }
        } catch (error) {
            toast.error('Failed to update');
        } finally {
            setSaving(null);
        }
    };

    const productsWithOffers = products.filter(p => p.discount || p.is_new);
    const productsWithoutOffers = products.filter(p => !p.discount && !p.is_new);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-display flex items-center gap-2">
                        <Tag className="h-6 w-6 text-primary" />
                        Manage Offers
                    </h1>
                    <p className="text-muted-foreground">
                        Add discounts and special offers to products
                    </p>
                </div>
            </div>

            {/* Current Offers */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Percent className="h-5 w-5 text-green-600" />
                    Active Offers ({productsWithOffers.length})
                </h2>
                {productsWithOffers.length === 0 ? (
                    <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
                        No active offers. Add discounts to products below.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {productsWithOffers.map((product) => (
                            <div key={product._id} className="bg-card border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                                    />
                                    <div className="flex-1 sm:hidden">
                                        <h3 className="font-medium line-clamp-1">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground">{product.category}</p>
                                    </div>
                                </div>
                                <div className="flex-1 w-full">
                                    <h3 className="font-medium hidden sm:block">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground hidden sm:block">{product.category}</p>
                                    <div className="flex items-center flex-wrap gap-2 mt-2 sm:mt-1">
                                        <span className="font-semibold">₹{product.price}</span>
                                        {product.original_price && (
                                            <span className="text-sm text-muted-foreground line-through">
                                                ₹{product.original_price}
                                            </span>
                                        )}
                                        {product.discount && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                                                {product.discount}% OFF
                                            </span>
                                        )}
                                        {product.is_new && (
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                                                NEW
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startEditing(product)}
                                        disabled={saving === product._id}
                                        className="flex-1 sm:flex-none"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeOffer(product._id)}
                                        disabled={saving === product._id}
                                        className="text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
                                    >
                                        {saving === product._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card border rounded-xl p-6 w-full max-w-md m-4">
                        <h3 className="text-lg font-semibold mb-4">Edit Offer</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Discount Percentage</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="90"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    placeholder="e.g. 20 for 20% off"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Original Price (before discount)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={originalPrice}
                                    onChange={(e) => setOriginalPrice(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    placeholder="Price shown as strikethrough"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <Button
                                onClick={() => {
                                    const product = products.find(p => p._id === editingProduct);
                                    if (product) saveOffer(product._id, product.price);
                                }}
                                disabled={saving !== null}
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save
                            </Button>
                            <Button variant="outline" onClick={cancelEditing}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* All Products */}
            <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-600" />
                    Add Offers to Products ({productsWithoutOffers.length})
                </h2>
                <div className="grid gap-3">
                    {productsWithoutOffers.map((product) => (
                        <div key={product._id} className="bg-card border rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                                />
                                <div className="flex-1 sm:hidden">
                                    <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                                    <p className="text-xs text-muted-foreground">{product.category} • ₹{product.price}</p>
                                </div>
                            </div>
                            <div className="flex-1 hidden sm:block">
                                <h3 className="font-medium text-sm">{product.name}</h3>
                                <p className="text-xs text-muted-foreground">{product.category} • ₹{product.price}</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleNew(product._id, false)}
                                    disabled={saving === product._id}
                                    className="flex-1 sm:flex-none whitespace-nowrap"
                                >
                                    Mark as NEW
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => startEditing(product)}
                                    disabled={saving === product._id}
                                    className="flex-1 sm:flex-none whitespace-nowrap"
                                >
                                    <Percent className="h-4 w-4 mr-1" />
                                    Add Discount
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminOffers;
