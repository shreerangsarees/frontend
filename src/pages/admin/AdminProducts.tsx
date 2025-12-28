import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit, Filter, MoreHorizontal, Image as ImageIcon, Loader2, X, Save } from 'lucide-react';
import { API_BASE_URL } from '@/apiConfig';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ImageUpload from '@/components/ui/ImageUpload';

import { useNavigate, useSearchParams } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  images?: string[];
  colors?: string[];
  category: string;
  categories?: string[];
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
  const { socket } = useSocket();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Product Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productImage, setProductImage] = useState(''); // For ImageUpload
  const [productImages, setProductImages] = useState<string[]>([]); // For Gallery Images
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');

  // Read URL params for actions
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Sync URL filter to state
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setFilter(filterParam);
    }
  }, [searchParams]);

  const handleFilterChange = (value: string) => {
    setFilter(value);
    // Update URL without refreshing
    setSearchParams(prev => {
      if (value === 'all') {
        prev.delete('filter');
      } else {
        prev.set('filter', value);
      }
      return prev;
    });
  };

  // Check for direct add action from URL
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setEditingProduct(null);
      setProductImage('');
      setProductImages([]);
      setSelectedCategories([]);
      setShowModal(true);
    }
  }, [searchParams]);

  // Real-time updates via Socket.io
  useEffect(() => {
    if (socket) {
      socket.on('productCreated', () => fetchProducts());
      socket.on('productUpdated', () => fetchProducts());
      socket.on('productDeleted', () => fetchProducts());
      socket.on('categoryCreated', () => fetchCategories());

      return () => {
        socket.off('productCreated');
        socket.off('productUpdated');
        socket.off('productDeleted');
        socket.off('categoryCreated');
      };
    }
  }, [socket]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('tmart_token');
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
      const token = localStorage.getItem('tmart_token');
      const res = await fetch(`${API_BASE_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('tmart_token');
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

      // Parse colors from comma-separated input
      const colorsStr = formData.get('colors')?.toString() || '';
      const colorsArray = colorsStr.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: Number(formData.get('price')),
        image: productImage || formData.get('image'), // Use state or fallback
        images: productImages.filter(url => url.trim().length > 0), // Use state for gallery images, filtering empty
        colors: colorsArray,
        category: selectedCategories[0] || 'General', // Primary category for backwards compat
        categories: selectedCategories.length > 0 ? selectedCategories : ['General'],
        stock: Number(formData.get('stock')),
        unit: formData.get('unit') || 'piece',
        isAvailable: true // Default to true for now
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const token = localStorage.getItem('tmart_token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const token = localStorage.getItem('tmart_token');
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error('Error deleting product');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'lowStock') return p.stock > 0 && p.stock <= 5;
    if (filter === 'outOfStock') return p.stock === 0;
    if (filter === 'active') return p.isAvailable;
    if (filter === 'unavailable') return !p.isAvailable;

    return true;
  });

  if (authLoading) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Products</h1>
          <p className="text-muted-foreground">{products.length} items</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setProductImage(''); setProductImages([]); setSelectedCategories([]); setShowModal(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sarees..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="all">All Products</option>
            <option value="active">Active</option>
            <option value="unavailable">Unavailable</option>
            <option value="lowStock">Low Stock</option>
            <option value="outOfStock">Out of Stock</option>
          </select>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-border">
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No products found</div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : <span className="text-xs flex items-center justify-center h-full">IMG</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold">₹{product.price}</span>
                      <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", product.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    {product.isAvailable ? 'Active' : 'Unavailable'}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingProduct(product); setProductImage(product.image || ''); setProductImages(product.images || []); setSelectedCategories(product.categories || [product.category]); setShowModal(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
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
                      <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(product); setProductImage(product.image || ''); setProductImages(product.images || []); setSelectedCategories(product.categories || [product.category]); setShowModal(true); }}>
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

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Categories (select all that apply)</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border max-h-32 overflow-y-auto">
                    {categories.length > 0 ? categories.map((cat) => (
                      <label
                        key={cat._id}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors",
                          selectedCategories.includes(cat.name)
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border border-border hover:border-primary"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedCategories.includes(cat.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, cat.name]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                            }
                          }}
                        />
                        {cat.name}
                      </label>
                    )) : (
                      <span className="text-sm text-muted-foreground">No categories. Create one first.</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowCategoryModal(true)}>
                      <Plus className="h-3 w-3 mr-1" /> Add Category
                    </Button>
                    {selectedCategories.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Selected: {selectedCategories.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Available Colors</label>
                  <Input
                    name="colors"
                    placeholder="Red, Maroon, Golden, Navy Blue"
                    defaultValue={editingProduct?.colors?.join(', ') || ''}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter color names separated by commas</p>
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
                  <Input name="unit" placeholder="pc, set, meter" defaultValue={editingProduct?.unit || 'pc'} required />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Primary Image</label>
                  <ImageUpload
                    value={productImage || editingProduct?.image || ''}
                    onChange={(url) => setProductImage(url as string)}
                    folder="products"
                    aspectRatio="3/4"
                    placeholder="Upload product image (3:4 ratio)"
                  />
                  <input type="hidden" name="image" value={productImage || editingProduct?.image || ''} />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Gallery Images</label>
                  <ImageUpload
                    value={productImages}
                    onChange={(val) => {
                      if (Array.isArray(val)) setProductImages(val);
                      else if (val) setProductImages([val]);
                      else setProductImages([]);
                    }}
                    folder="products/gallery"
                    aspectRatio="1/1"
                    placeholder="Upload gallery images key"
                    allowMultiple={true}
                  />
                  <input type="hidden" name="images" value={productImages.join(',')} />

                  <div className="mt-3">
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Paste URLs (Separated by ';')</label>
                    <Textarea
                      placeholder="https://example.com/image1.jpg; https://example.com/image2.jpg"
                      value={productImages.join(';')}
                      onChange={(e) => {
                        const val = e.target.value;
                        const urls = val.split(';').map((u: string) => u.trim());
                        setProductImages(urls);
                      }}
                      className="font-mono text-xs min-h-[80px]"
                    />
                  </div>
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
                <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Banarasi" required />
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
