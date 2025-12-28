import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, Save, Loader2, MapPin, Plus, Trash2, X, Package, ArrowRight, Bell, Edit, Check, Star } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from '@/apiConfig';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Profile: React.FC = () => {
    const { user, refreshProfile, loading: authLoading } = useAuth();
    const { requestPermission } = useNotifications();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Address State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newAddress, setNewAddress] = useState({
        label: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        is_default: false
    });

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token} `
                },
                body: JSON.stringify({
                    name,
                    currentPassword: currentPassword || undefined,
                    newPassword: newPassword || undefined
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Profile updated successfully');
                await refreshProfile();
                setCurrentPassword('');
                setNewPassword('');
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Phone is now required
        if (!newAddress.street || !newAddress.city || !newAddress.zip || !newAddress.phone) {
            toast.error("Please fill in all required fields (Address, City, ZIP, Phone)");
            return;
        }

        // Format full address cleanly (handle empty state)
        const parts = [
            newAddress.street,
            newAddress.city,
            newAddress.state,
            newAddress.zip
        ].filter(Boolean); // Remove empty strings

        const full_address = parts.join(', ');

        // Ensure compatibility with backend Address type
        const addressToAdd = {
            ...newAddress,
            full_address,
            pincode: newAddress.zip,
        };

        let updatedAddresses = [...(user?.addresses || [])];

        // If setting as default, unset others first
        if (addressToAdd.is_default) {
            updatedAddresses = updatedAddresses.map(a => ({ ...a, is_default: false }));
        }

        if (editingIndex !== null) {
            // Edit existing
            updatedAddresses[editingIndex] = addressToAdd;
        } else {
            // Add new
            // If it's the first address, make it default automatically
            if (updatedAddresses.length === 0) {
                addressToAdd.is_default = true;
            }
            updatedAddresses.push(addressToAdd);
        }

        const successMsg = editingIndex !== null ? "Address updated successfully" : "Address added successfully";
        await updateAddresses(updatedAddresses, successMsg);

        resetAddressForm();
    };

    const resetAddressForm = () => {
        setShowAddressForm(false);
        setEditingIndex(null);
        setNewAddress({ label: '', street: '', city: '', state: '', zip: '', phone: '', is_default: false });
    };

    const handleEditAddress = (index: number) => {
        if (!user?.addresses) return;
        const addr = user.addresses[index];
        setNewAddress({
            label: addr.label || '',
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            zip: addr.zip || addr.pincode || '',
            phone: addr.phone || '',
            is_default: addr.is_default || false
        });
        setEditingIndex(index);
        setShowAddressForm(true);
        // Scroll to form
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleSetDefaultAddress = async (index: number) => {
        if (!user?.addresses) return;
        const updatedAddresses = user.addresses.map((addr, i) => ({
            ...addr,
            is_default: i === index
        }));
        await updateAddresses(updatedAddresses, "Default address updated");
    };

    const handleDeleteAddress = async (index: number) => {
        if (!user?.addresses) return;
        const updatedAddresses = user.addresses.filter((_, i) => i !== index);
        await updateAddresses(updatedAddresses, "Address removed");
    };

    const updateAddresses = async (addresses: any[], successMessage: string) => {
        try {
            const token = localStorage.getItem('tmart_token');
            const payload = { addresses };
            // console.log("Sending address update:", payload);

            const res = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token} `
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(successMessage);
                await refreshProfile();
            } else {
                // console.error("Address update error response:", data);
                toast.error(data.message || `Failed to update: ${res.statusText} `);
            }
        } catch (error: any) {
            console.error("Network error updating address:", error);
            toast.error(error.message || "Network error");
        }
    };

    if (authLoading) return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div></Layout>;

    if (!user) return <Layout><div className="text-center py-20">Please login to view profile</div></Layout>;

    return (
        <Layout>
            <div className="container-app py-8">
                <h1 className="text-3xl font-display font-bold text-foreground mb-8">My Profile</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar / Info Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 text-center">
                            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold overflow-hidden">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name?.[0]?.toUpperCase() || 'U'
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                            <p className="text-muted-foreground text-sm mb-4">{user.email}</p>
                            <div className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-medium capitalize">
                                {user.role} Account
                            </div>
                        </div>



                        {/* My Orders Link */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" /> Orders
                            </h3>
                            <Button
                                className="w-full justify-between"
                                variant="outline"
                                onClick={() => window.location.href = '/my-orders'}
                            >
                                View My Orders
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* 
                        <div className="bg-card border border-border rounded-2xl p-6">
                             <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Bell className="h-4 w-4 text-primary" /> Notifications
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Permission:</span>
                                    <span className={('Notification' in window && Notification.permission === 'granted') ? 'text-green-600 font-bold' : 'text-red-500'}>
                                        {('Notification' in window) ? Notification.permission : 'unsupported'}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground bg-muted p-2 rounded break-all">
                                    {('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker?.controller) ? 'Service Worker Active' : 'SW Pending/Inactive'}
                                </div>
                                <Button size="sm" variant="outline" className="w-full mt-2" onClick={requestPermission}>
                                    Test / Fix Permission
                                </Button>
                            </div>
                        </div>
                        */}
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-8">

                        {/* Address Management Section */}
                        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" /> Saved Addresses
                                </h3>
                                <Button size="sm" variant="outline" onClick={() => setShowAddressForm(!showAddressForm)}>
                                    {showAddressForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
                                    {showAddressForm ? 'Cancel' : 'Add Address'}
                                </Button>
                            </div>

                            {/* Add Address Form */}
                            {showAddressForm && (
                                <form onSubmit={handleAddAddress} className="bg-muted/30 p-4 rounded-xl mb-6 border border-border animate-fade-in">
                                    <h4 className="font-bold mb-3 text-sm">{editingIndex !== null ? 'Edit Address' : 'New Address'}</h4>
                                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                        <Input
                                            placeholder="Label (e.g. Home, Office)"
                                            value={newAddress.label}
                                            onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                                        />
                                        <Input
                                            placeholder="Phone Number"
                                            required
                                            value={newAddress.phone}
                                            onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                        />
                                        <Input
                                            placeholder="Full Address *"
                                            required
                                            value={newAddress.street}
                                            onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                                            className="sm:col-span-2"
                                        />
                                        <Input
                                            placeholder="City *"
                                            required
                                            value={newAddress.city}
                                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                        />
                                        <Input
                                            placeholder="State"
                                            value={newAddress.state}
                                            onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                                        />
                                        <Input
                                            placeholder="ZIP Code *"
                                            required
                                            value={newAddress.zip}
                                            onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <input
                                            type="checkbox"
                                            id="isDefault"
                                            checked={newAddress.is_default}
                                            onChange={e => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="isDefault" className="text-sm font-medium">Set as default address</label>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="ghost" size="sm" onClick={resetAddressForm}>Cancel</Button>
                                        <Button type="submit" size="sm">Save Address</Button>
                                    </div>
                                </form>
                            )}

                            {/* Address List */}
                            {user.addresses && user.addresses.length > 0 ? (
                                <div className="space-y-4">
                                    {user.addresses.map((addr, i) => (
                                        <div key={i} className={`flex flex - col sm: flex - row sm: items - start justify - between p - 4 border rounded - xl transition - colors ${addr.is_default ? 'bg-primary/5 border-primary/20' : 'bg-muted/10 border-border hover:bg-muted/30'} `}>
                                            <div className="mb-3 sm:mb-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">{addr.label || 'Home'}</span>
                                                    {addr.is_default && (
                                                        <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Check className="h-3 w-3" /> Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-foreground/80 mb-1">
                                                    {addr.full_address || `${addr.street}, ${addr.city}, ${addr.zip} `}
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {addr.phone}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 self-end sm:self-start">
                                                {!addr.is_default && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-muted-foreground hover:text-primary h-8 px-2 text-xs"
                                                        onClick={() => handleSetDefaultAddress(i)}
                                                    >
                                                        Make Default
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    onClick={() => handleEditAddress(i)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDeleteAddress(i)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No addresses saved yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Support & Complaints Section */}
                        <div className="bg-card border border-border rounded-2xl p-6 mt-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-primary" /> Support & Help
                            </h3>
                            <div className="space-y-3">
                                <a
                                    href="tel:9137554336"
                                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <Phone className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Call Support</p>
                                        <p className="text-sm text-muted-foreground">9137554336</p>
                                    </div>
                                </a>

                                <a
                                    href="https://wa.me/919137554336"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">WhatsApp</p>
                                        <p className="text-sm text-muted-foreground">Quick chat support</p>
                                    </div>
                                </a>

                                <a
                                    href="mailto:support@shreerangsaree.com"
                                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Email Support</p>
                                        <p className="text-sm text-muted-foreground">support@shreerangsaree.com</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Edit Profile Form */}
                        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 md:p-8">
                            <h2 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" /> Edit Details
                            </h2>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-9"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-9 bg-muted/50"
                                                value={email}
                                                readOnly
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-6">
                                    <h3 className="font-bold mb-4 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                                        Change Password
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Current Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="password"
                                                    className="pl-9"
                                                    placeholder="••••••••"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="password"
                                                    className="pl-9"
                                                    placeholder="••••••••"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Leave password fields empty to keep current password.</p>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" variant="hero" disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
