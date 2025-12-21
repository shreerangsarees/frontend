import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, Save, Loader2, MapPin } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Profile: React.FC = () => {
    const { user, refreshProfile, loading: authLoading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

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
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    // email is usually immutable or requires verification, skipping update for now
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

    if (authLoading) return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-coral" /></div></Layout>;

    if (!user) return <Layout><div className="text-center py-20">Please login to view profile</div></Layout>;

    return (
        <Layout>
            <div className="container-app py-8">
                <h1 className="text-3xl font-display font-bold text-foreground mb-8">My Profile</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar / Info Card */}
                    <div className="md:col-span-1">
                        <div className="bg-card border border-border rounded-2xl p-6 text-center">
                            <div className="w-24 h-24 bg-coral/10 text-coral rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                                {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                            <p className="text-muted-foreground text-sm mb-4">{user.email}</p>
                            <div className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-medium capitalize">
                                {user.role} Account
                            </div>
                        </div>

                        {/* Addresses Preview (Optional link) */}
                        <div className="bg-card border border-border rounded-2xl p-6 mt-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-coral" /> Saved Addresses
                            </h3>
                            {user.addresses && user.addresses.length > 0 ? (
                                <ul className="space-y-3 text-sm">
                                    {user.addresses.map((addr, i) => (
                                        <li key={i} className="text-muted-foreground pb-2 border-b border-border last:border-0 last:pb-0">
                                            <span className="font-medium text-foreground block">{addr.label}</span>
                                            {addr.city}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No addresses saved.</p>
                            )}
                        </div>

                        {/* Support & Complaints Section */}
                        <div className="bg-card border border-border rounded-2xl p-6 mt-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-coral" /> Support & Help
                            </h3>
                            <div className="space-y-3">
                                <a
                                    href="tel:7096867438"
                                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <Phone className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Call Support</p>
                                        <p className="text-sm text-muted-foreground">7096867438</p>
                                    </div>
                                </a>

                                <a
                                    href="https://wa.me/917096867438"
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
                                    href="mailto:support@tmart.com?subject=Customer Complaint"
                                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-full bg-coral/10 flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-coral" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">File a Complaint</p>
                                        <p className="text-sm text-muted-foreground">Email our team</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="md:col-span-2">
                        <div className="bg-card border border-border rounded-2xl p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <User className="h-5 w-5 text-coral" /> Edit Details
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
