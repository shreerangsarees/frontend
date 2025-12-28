import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2, Edit2, FolderTree, Image as ImageIcon, X, Save, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/apiConfig';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';

interface Category {
    _id: string;
    name: string;
    image: string;
    productCount: number;
    description?: string;
    icon?: string;
    type?: 'regular' | 'occasion';
    color?: string;
}

const AdminCategories: React.FC = () => {
    const { socket } = useSocket();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', image: '', description: '', type: 'regular' as 'regular' | 'occasion', color: '' });

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
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Real-time updates via Socket.io
    useEffect(() => {
        if (socket) {
            socket.on('categoryCreated', () => fetchCategories());
            socket.on('categoryUpdated', () => fetchCategories());
            socket.on('categoryDeleted', () => fetchCategories());

            return () => {
                socket.off('categoryCreated');
                socket.off('categoryUpdated');
                socket.off('categoryDeleted');
            };
        }
    }, [socket]);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('tmart_token');
            const url = editingId ? `${API_BASE_URL}/categories/${editingId}` : `${API_BASE_URL}/categories`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(`Category ${editingId ? 'updated' : 'created'} successfully`);
                setIsModalOpen(false);
                setFormData({ name: '', image: '', description: '', type: 'regular', color: '' });
                setEditingId(null);
                fetchCategories();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Error saving category');
            }
        } catch (error) {
            toast.error('Error saving category');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Category deleted');
                fetchCategories();
            }
        } catch (error) {
            toast.error('Error deleting category');
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Categories</h1>
                        <p className="text-sm text-muted-foreground">Manage product categories</p>
                    </div>
                    <Button size="sm" onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData({ name: '', image: '', description: '', type: 'regular', color: '' }); }} className="gap-1 sm:gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Category</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>

                <div className="flex items-center gap-4 bg-card p-3 sm:p-4 rounded-xl border border-border">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                    />
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-3">
                    {loading ? (
                        <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No categories found</div>
                    ) : (
                        filteredCategories.map((cat) => (
                            <div key={cat._id} className="bg-card rounded-xl border border-border p-4">
                                <div className="flex items-center gap-3">
                                    {cat.image ? (
                                        <img src={cat.image} alt={cat.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                                            No img
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{cat.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.type === 'occasion' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {cat.type === 'occasion' ? 'Occasion' : 'Regular'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{cat.productCount} products</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            setEditingId(cat._id);
                                            setFormData({ name: cat.name, image: cat.image, description: cat.description || '', type: cat.type || 'regular', color: cat.color || '' });
                                            setIsModalOpen(true);
                                        }}>
                                            <Edit2 className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(cat._id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block border border-border rounded-xl bg-card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50 text-left text-sm font-medium text-muted-foreground">
                            <tr>
                                <th className="p-4">Image</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Type</th>
                                <th className="p-4 text-center">Products</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No categories found</td></tr>
                            ) : (
                                filteredCategories.map((cat) => (
                                    <tr key={cat._id} className="hover:bg-muted/30">
                                        <td className="p-4">
                                            {cat.image ? (
                                                <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                                    No img
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-medium">{cat.name}</p>
                                            {cat.description && <p className="text-sm text-muted-foreground truncate max-w-[200px]">{cat.description}</p>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.type === 'occasion'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {cat.type === 'occasion' ? 'Occasion' : 'Regular'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">{cat.productCount}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon-sm" onClick={() => {
                                                    setEditingId(cat._id);
                                                    setFormData({ name: cat.name, image: cat.image, description: cat.description || '', type: cat.type || 'regular', color: cat.color || '' });
                                                    setIsModalOpen(true);
                                                }}>
                                                    <Edit2 className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(cat._id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 animate-in fade-in zoom-in duration-200 max-h-[85vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Category' : 'Add Category'}</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Category Name</label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Silk Saree" />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Image URL</label>
                                <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                                {formData.image && (
                                    <img src={formData.image} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Description</label>
                                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Category Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'regular' | 'occasion' })}
                                    className="w-full p-2 rounded-lg border border-border bg-background"
                                >
                                    <option value="regular">Regular Category</option>
                                    <option value="occasion">Occasion (Shop by Occasion)</option>
                                </select>
                            </div>

                            {formData.type === 'occasion' && (
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Gradient Color</label>
                                    <select
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-border bg-background"
                                    >
                                        <option value="">Select a gradient...</option>
                                        <option value="from-red-900 to-rose-800">Red/Rose (Wedding)</option>
                                        <option value="from-amber-600 to-orange-700">Amber/Orange (Festive)</option>
                                        <option value="from-purple-900 to-indigo-900">Purple/Indigo (Party)</option>
                                        <option value="from-slate-700 to-slate-900">Slate (Casual)</option>
                                        <option value="from-emerald-700 to-teal-800">Emerald/Teal</option>
                                        <option value="from-pink-600 to-fuchsia-700">Pink/Fuchsia</option>
                                    </select>
                                </div>
                            )}

                            <Button className="w-full mt-2" onClick={handleSave}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Category
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
};

export default AdminCategories;
