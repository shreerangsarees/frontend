import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, Image, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';
import ImageUpload from '@/components/ui/ImageUpload';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Banner {
    _id: string;
    title?: string;
    subtitle?: string;
    image: string;
    link: string;
    buttonText?: string;
    isActive: boolean;
    order: number;
}

interface Category {
    id: string;
    name: string;
}

const AdminBanners: React.FC = () => {
    const { socket } = useSocket();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [formData, setFormData] = useState({
        image: '',
        link: '',
        isActive: true
    });

    useEffect(() => {
        fetchBanners();
        fetchCategories();
    }, []);

    // Real-time updates
    useEffect(() => {
        if (socket) {
            socket.on('bannerCreated', (banner: Banner) => {
                setBanners(prev => [...prev, banner]);
            });
            socket.on('bannerUpdated', (banner: Banner) => {
                setBanners(prev => prev.map(b => b._id === banner._id ? banner : b));
            });
            socket.on('bannerDeleted', ({ bannerId }: { bannerId: string }) => {
                setBanners(prev => prev.filter(b => b._id !== bannerId));
            });

            return () => {
                socket.off('bannerCreated');
                socket.off('bannerUpdated');
                socket.off('bannerDeleted');
            };
        }
    }, [socket]);

    const fetchBanners = async () => {
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch('/api/banners/admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBanners(data);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.image || !formData.link) {
            toast.error('Image and Category Link are required');
            return;
        }

        try {
            const token = localStorage.getItem('tmart_token');
            const url = editingBanner ? `/api/banners/${editingBanner._id}` : '/api/banners';
            const method = editingBanner ? 'PUT' : 'POST';

            // Auto-generate title from link for DB compatibility if needed
            const categoryName = categories.find(c => `/products?category=${c.name}` === formData.link)?.name || 'Banner';

            const payload = {
                ...formData,
                title: categoryName, // hidden field for backend
                subtitle: '',
                buttonText: ''
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingBanner ? 'Banner updated!' : 'Banner created!');
                resetForm();
                fetchBanners();
            } else {
                toast.error('Failed to save banner');
            }
        } catch (error) {
            toast.error('Error saving banner');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this banner?')) return;

        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`/api/banners/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Banner deleted');
                fetchBanners();
            }
        } catch (error) {
            toast.error('Error deleting banner');
        }
    };

    const toggleActive = async (banner: Banner) => {
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`/api/banners/${banner._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...banner, isActive: !banner.isActive })
            });
            if (res.ok) {
                toast.success(banner.isActive ? 'Banner hidden' : 'Banner visible');
                fetchBanners();
            }
        } catch (error) {
            toast.error('Error updating banner');
        }
    };

    const resetForm = () => {
        setFormData({ image: '', link: '', isActive: true });
        setEditingBanner(null);
        setShowForm(false);
    };

    const startEdit = (banner: Banner) => {
        setFormData({
            image: banner.image,
            link: banner.link,
            isActive: banner.isActive
        });
        setEditingBanner(banner);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Banner Management</h1>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Banner
                    </Button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-card rounded-xl border border-border p-6">
                        <h2 className="font-semibold mb-4">{editingBanner ? 'Edit Banner' : 'New Banner'}</h2>
                        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Banner Image *</label>
                                <ImageUpload
                                    value={formData.image}
                                    onChange={(url) => setFormData({ ...formData, image: Array.isArray(url) ? url[0] : url })}
                                    folder="banners"
                                    aspectRatio="16/9"
                                    className="max-w-lg"
                                    placeholder="Upload banner image (16:9 ratio recommended)"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Linked Category *</label>
                                <Select
                                    value={formData.link}
                                    onValueChange={(val) => setFormData({ ...formData, link: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={`/products?category=${cat.name}`}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">This banner will link directly to the selected category page.</p>
                            </div>

                            <div className="md:col-span-2 flex gap-2 pt-2">
                                <Button type="submit">
                                    {editingBanner ? 'Update' : 'Create'} Banner
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>

                        {/* Preview */}
                        {formData.image && (
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground mb-2">Preview (Clickable Image):</p>
                                <div className="relative rounded-xl overflow-hidden h-48 bg-muted cursor-pointer hover:opacity-90 transition-opacity">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Banners List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : banners.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                        <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No banners yet. Add your first banner!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {banners.map((banner) => (
                            <div key={banner._id} className="bg-card rounded-xl border border-border overflow-hidden">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="sm:w-64 h-48 sm:h-40 bg-muted shrink-0 relative">
                                        <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
                                        {!banner.isActive && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <EyeOff className="text-white h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <h3 className="font-semibold text-lg">Banner</h3>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => toggleActive(banner)}>
                                                        {banner.isActive ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => startEdit(banner)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(banner._id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">Links to:</span> {banner.link}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminBanners;
