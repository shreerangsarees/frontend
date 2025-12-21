import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Store, User, Save } from 'lucide-react';

const AdminSettings: React.FC = () => {
    const [storeName, setStoreName] = useState('T-Mart Express');
    const [deliveryFee, setDeliveryFee] = useState('40');
    const [minOrder, setMinOrder] = useState('499');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setStoreName(data.storeName);
                setDeliveryFee(data.deliveryFee.toString());
                setMinOrder(data.minOrderFreeDelivery.toString());
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleStoreSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeName,
                    deliveryFee: Number(deliveryFee),
                    minOrderFreeDelivery: Number(minOrder)
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
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Store className="h-5 w-5 text-coral" />
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
                                    <label className="text-sm font-medium mb-1 block">Free Delivery Above (₹)</label>
                                    <Input
                                        type="number"
                                        value={minOrder}
                                        onChange={(e) => setMinOrder(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Account Settings */}
                    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <User className="h-5 w-5 text-coral" />
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
