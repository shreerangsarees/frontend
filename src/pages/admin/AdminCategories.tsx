import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
    _id: string;
    name: string;
    image: string;
    productCount: number;
    description?: string;
    icon?: string;
}

const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', image: '', icon: '', description: '' });

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
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

    const handleSave = async () => {
        try {
            const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(`Category ${editingId ? 'updated' : 'created'} successfully`);
                setIsModalOpen(false);
                setFormData({ name: '', image: '', icon: '', description: '' });
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
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display font-bold text-foreground">Categories</h1>
                        <p className="text-muted-foreground">Manage product categories</p>
                    </div>
                    <Button onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData({ name: '', image: '', icon: '', description: '' }); }} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Category
                    </Button>
                </div>

                <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none"
                    />
                </div>

                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50 text-left text-sm font-medium text-muted-foreground">
                            <tr>
                                <th className="p-4">Icon</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Image URL</th>
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
                                        <td className="p-4 text-2xl">{cat.icon || '📦'}</td>
                                        <td className="p-4 font-medium">{cat.name}</td>
                                        <td className="p-4 text-sm text-muted-foreground truncate max-w-[200px]">{cat.image}</td>
                                        <td className="p-4 text-center">{cat.productCount}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon-sm" onClick={() => {
                                                    setEditingId(cat._id);
                                                    setFormData({ name: cat.name, image: cat.image, icon: cat.icon || '', description: cat.description || '' });
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
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Category' : 'Add Category'}</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Category Name</label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Vegetables" />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Image URL</label>
                                <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Icon (Emoji)</label>
                                <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="e.g. 🥬" />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Description</label>
                                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
                            </div>

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
