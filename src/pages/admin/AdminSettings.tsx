import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ui/ImageUpload';
import { toast } from 'sonner';
import { Store, User, Save, Plus, Trash2, Star } from 'lucide-react';

const AdminSettings: React.FC = () => {
    const [storeName, setStoreName] = useState('Shreerang Saree');
    const [deliveryFee, setDeliveryFee] = useState('40');
    const [minOrder, setMinOrder] = useState('499');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [youtubeVideos, setYoutubeVideos] = useState<{ id: string; title: string }[]>([]);
    const [instagramPosts, setInstagramPosts] = useState<{ imageUrl: string; postUrl: string }[]>([]);

    // Spotlight Settings
    const [spotlight, setSpotlight] = useState({
        active: true,
        title: '',
        description: '',
        badge: '',
        image: '',
        categoryId: ''
    });
    const [categories, setCategories] = useState<any[]>([]);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchSettings();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) setCategories(await res.json());
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch('/api/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setStoreName(data.storeName);
                setDeliveryFee(data.deliveryFee.toString());
                setMinOrder(data.minOrderFreeDelivery.toString());
                setYoutubeUrl(data.youtubeUrl || '');
                setInstagramUrl(data.instagramUrl || '');
                setInstagramPosts(data.instagramPosts || []);
                setYoutubeVideos(data.youtubeVideos || []);
                if (data.spotlight) setSpotlight(data.spotlight);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleStoreSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    storeName,
                    deliveryFee: Number(deliveryFee),
                    minOrderFreeDelivery: Number(minOrder),
                    youtubeUrl,
                    instagramUrl,
                    youtubeVideos,
                    instagramPosts,
                    spotlight
                })
            });
            if (res.ok) {
                toast.success('Store settings updated');
            } else {
                toast.error('Failed to update settings');
            }
        } catch (error) {
            toast.error('Error saving settings');
        }
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Profile updated');
                setCurrentPassword('');
                setNewPassword('');
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Error updating profile');
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold font-display mb-8">Settings</h1>

                <div className="grid gap-8">
                    {/* Store Settings */}
                    <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                            <Store className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold">Store Configuration</h2>
                        </div>

                        <form onSubmit={handleStoreSave} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Store Name</label>
                                    <Input
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Delivery Fee (₹)</label>
                                    <Input
                                        type="number"
                                        value={deliveryFee}
                                        onChange={(e) => setDeliveryFee(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Min Order for Free Delivery (₹)</label>
                                    <Input
                                        type="number"
                                        value={minOrder}
                                        onChange={(e) => setMinOrder(e.target.value)}
                                    />
                                </div>

                                {/* Spotlight Settings */}
                                <div className="col-span-2 grid sm:grid-cols-2 gap-4 pt-4 border-t border-border mt-4">
                                    <div className="col-span-2 flex items-center gap-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <h3 className="font-semibold">Home Config: Spotlight</h3>
                                    </div>

                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-sm font-medium mb-1 block">Title (e.g. The Royal Paithani)</label>
                                        <Input
                                            value={spotlight.title}
                                            onChange={(e) => setSpotlight({ ...spotlight, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-sm font-medium mb-1 block">Badge (e.g. Signature Collection)</label>
                                        <Input
                                            value={spotlight.badge}
                                            onChange={(e) => setSpotlight({ ...spotlight, badge: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium mb-1 block">Description</label>
                                        <Textarea
                                            value={spotlight.description}
                                            onChange={(e) => setSpotlight({ ...spotlight, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-sm font-medium mb-1 block">Spotlight Image</label>
                                        <ImageUpload
                                            value={spotlight.image}
                                            onChange={(url) => setSpotlight({ ...spotlight, image: url as string })}
                                        />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-sm font-medium mb-1 block">Linked Category</label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                            value={spotlight.categoryId}
                                            onChange={(e) => setSpotlight({ ...spotlight, categoryId: e.target.value })}
                                        >
                                            <option value="">Select a Category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="col-span-2 grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                                    <div className="col-span-2">
                                        <h3 className="font-semibold mb-2">Social Media & Content</h3>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">YouTube Channel URL</label>
                                        <Input
                                            value={youtubeUrl}
                                            onChange={(e) => setYoutubeUrl(e.target.value)}
                                            placeholder="https://youtube.com/@channel"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-sm">YouTube Videos</h4>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setYoutubeVideos([...youtubeVideos, { id: '', title: '' }])}
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Add Video
                                            </Button>
                                        </div>
                                        <div className="space-y-3">
                                            {youtubeVideos.map((video, index) => (
                                                <div key={index} className="flex gap-2 items-start">
                                                    <div className="flex-1 space-y-2">
                                                        <Input
                                                            placeholder="Video Title"
                                                            value={video.title}
                                                            onChange={(e) => {
                                                                const newVideos = [...youtubeVideos];
                                                                newVideos[index].title = e.target.value;
                                                                setYoutubeVideos(newVideos);
                                                            }}
                                                        />
                                                        <Input
                                                            placeholder="Video ID (e.g. dQw4w9WgXcQ)"
                                                            value={video.id}
                                                            onChange={(e) => {
                                                                const newVideos = [...youtubeVideos];
                                                                newVideos[index].id = e.target.value;
                                                                setYoutubeVideos(newVideos);
                                                            }}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                                                        onClick={() => {
                                                            const newVideos = youtubeVideos.filter((_, i) => i !== index);
                                                            setYoutubeVideos(newVideos);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {youtubeVideos.length === 0 && (
                                                <p className="text-sm text-muted-foreground italic">No videos added yet.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium mb-1 block">Instagram Profile URL</label>
                                        <Input
                                            value={instagramUrl}
                                            onChange={(e) => setInstagramUrl(e.target.value)}
                                            placeholder="https://instagram.com/profile"
                                        />
                                    </div>

                                    {/* Instagram Posts Management */}
                                    <div className="col-span-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-sm">Instagram Feed (Latest Posts)</h4>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setInstagramPosts([...instagramPosts, { imageUrl: '', postUrl: '' }])}
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Add Post
                                            </Button>
                                        </div>
                                        <div className="space-y-4">
                                            {instagramPosts.map((post, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-xl border items-start">
                                                    <div className="w-full sm:w-32 flex-shrink-0">
                                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Post Image</label>
                                                        <ImageUpload
                                                            value={post.imageUrl}
                                                            onChange={(url) => {
                                                                const newPosts = [...instagramPosts];
                                                                newPosts[index].imageUrl = url as string;
                                                                setInstagramPosts(newPosts);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-3 w-full">
                                                        <div className="pt-6">
                                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Post Link</label>
                                                            <Input
                                                                placeholder="https://instagram.com/p/..."
                                                                value={post.postUrl}
                                                                onChange={(e) => {
                                                                    const newPosts = [...instagramPosts];
                                                                    newPosts[index].postUrl = e.target.value;
                                                                    setInstagramPosts(newPosts);
                                                                }}
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 -ml-2"
                                                            onClick={() => {
                                                                const newPosts = instagramPosts.filter((_, i) => i !== index);
                                                                setInstagramPosts(newPosts);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" /> Remove Post
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {instagramPosts.length === 0 && (
                                                <p className="text-sm text-muted-foreground italic">No posts added yet. Using defaults.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit">
                                    Save Store Settings
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Account Settings */}
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <User className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold">Account Security</h2>
                        </div>

                        <form onSubmit={handleProfileSave} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Current Password</label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">New Password</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" variant="outline">
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
