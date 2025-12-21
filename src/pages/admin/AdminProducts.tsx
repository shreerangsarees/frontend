import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Loader2, Save } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  stock: number;
  unit: string;
  isAvailable: boolean;
  created_at?: string;
}

interface Category {
  _id: string;
  name: string;
}

const AdminProducts: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Product Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((p: any) => ({
          ...p,
          category: p.category || 'General',
          id: p._id || p.id
        }));
        setProducts(mapped);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (error) {
      console.error('Error fetching categories');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName,
          image: newCategoryImage,
          icon: '📦' // Default icon
        })
      });

      if (res.ok) {
        toast.success('Category created');
        setShowCategoryModal(false);
        setNewCategoryName('');
        setNewCategoryImage('');
        await fetchCategories(); // Refresh list
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to create category');
      }
    } catch (error) {
      toast.error('Error creating category');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const payload = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: Number(formData.get('price')),
        image: formData.get('image'),
        category: formData.get('category'),
        stock: Number(formData.get('stock')),
        unit: formData.get('unit') || 'piece',
        isAvailable: true // Default to true for now
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save product');
      }

      toast.success(editingProduct ? 'Product updated' : 'Product created');
      setShowModal(false);
      fetchProducts();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error('Error deleting product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Products</h1>
          <p className="text-muted-foreground">{products.length} items</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setShowModal(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No products found</td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : <span className="text-xs">IMG</span>}
                        </div>
                        <span className="font-medium text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">₹{product.price}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">{product.unit}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", product.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {product.isAvailable ? 'Active' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(product); setShowModal(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input name="name" placeholder="Product Name" defaultValue={editingProduct?.name} required />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Input name="description" placeholder="Product Description" defaultValue={editingProduct?.description || ''} required />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <div className="flex gap-2">
                    <select
                      name="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      defaultValue={editingProduct?.category || (categories.length > 0 ? categories[0].name : 'General')}
                    >
                      {/* Always show product's current category first if editing */}
                      {editingProduct?.category && !categories.find(c => c.name === editingProduct.category) && (
                        <option value={editingProduct.category}>{editingProduct.category}</option>
                      )}
                      {/* Show categories from database */}
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                      {/* Fallback options if no categories exist */}
                      {categories.length === 0 && (
                        <>
                          <option value="General">General</option>
                          <option value="Vegetables">Vegetables</option>
                          <option value="Fruits">Fruits</option>
                          <option value="Dairy">Dairy</option>
                          <option value="Bakery">Bakery</option>
                          <option value="Beverages">Beverages</option>
                          <option value="Snacks">Snacks</option>
                        </>
                      )}
                    </select>
                    <Button type="button" size="icon" variant="outline" onClick={() => setShowCategoryModal(true)} title="Add New Category">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Price (₹)</label>
                  <Input name="price" type="number" placeholder="0.00" defaultValue={editingProduct?.price} required />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Stock</label>
                  <Input name="stock" type="number" placeholder="0" defaultValue={editingProduct?.stock} required />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Unit</label>
                  <Input name="unit" placeholder="kg, pc, bunch" defaultValue={editingProduct?.unit || 'kg'} required />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Image URL</label>
                  <Input name="image" placeholder="https://..." defaultValue={editingProduct?.image || ''} required />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">{editingProduct ? 'Update Product' : 'Create Product'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">New Category</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCategoryModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Spices" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Image URL</label>
                <Input value={newCategoryImage} onChange={(e) => setNewCategoryImage(e.target.value)} placeholder="https://..." required />
              </div>
              <Button type="submit" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Category
              </Button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
