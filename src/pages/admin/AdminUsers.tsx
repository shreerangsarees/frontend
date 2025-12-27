import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Truck, User, Trash2, Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/dateUtils';

interface UserData {
    _id: string;
    name?: string;
    displayName?: string;
    email: string;
    role: 'customer' | 'admin' | 'delivery';
    avatar?: string;
    provider?: string;
    createdAt?: string;
}

const roleConfig = {
    customer: { label: 'Customer', icon: User, color: 'bg-blue-100 text-blue-700' },
    admin: { label: 'Admin', icon: Shield, color: 'bg-purple-100 text-purple-700' }
};

const AdminUsers: React.FC = () => {
    const { user: currentUser, loading: authLoading } = useAuth();
    const { socket } = useSocket();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Real-time updates via Socket.io
    useEffect(() => {
        if (socket) {
            socket.on('userCreated', () => fetchUsers());
            socket.on('userUpdated', () => fetchUsers());
            socket.on('userDeleted', () => fetchUsers());

            return () => {
                socket.off('userCreated');
                socket.off('userUpdated');
                socket.off('userDeleted');
            };
        }
    }, [socket]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                throw new Error('Failed to fetch users');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        setUpdatingUserId(userId);
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`/api/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('User role updated successfully');
                fetchUsers();
            } else {
                throw new Error(data.message || 'Failed to update role');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to update role');
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('User deleted successfully');
                fetchUsers();
            } else {
                throw new Error(data.message || 'Failed to delete user');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name || user.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.role || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading) return <div>Loading...</div>;

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-display flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        User Management
                    </h1>
                    <p className="text-muted-foreground">{users.length} users registered</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Role Legend */}
            <div className="flex flex-wrap gap-3 mb-6">
                {Object.entries(roleConfig).map(([role, config]) => (
                    <div key={role} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm", config.color)}>
                        <config.icon className="h-4 w-4" />
                        {config.label}
                    </div>
                ))}
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Provider</th>
                                <th className="px-6 py-3">Current Role</th>
                                <th className="px-6 py-3">Change Role</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const config = roleConfig[user.role] || { label: 'Unknown', icon: User, color: 'bg-gray-100 text-gray-700' };
                                    const isCurrentUser = currentUser?.id === user._id;

                                    return (
                                        <tr key={user._id} className={cn("hover:bg-muted/30", isCurrentUser && "bg-primary/5")}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-primary font-semibold">
                                                                {(user.name || user.displayName || 'U').charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{user.name || user.displayName || 'Unknown User'}</p>
                                                        {isCurrentUser && (
                                                            <span className="text-xs text-primary">(You)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="capitalize text-muted-foreground">{user.provider}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn("px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1", config.color)}>
                                                    <config.icon className="h-3 w-3" />
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    className="border rounded px-2 py-1 text-xs bg-background disabled:opacity-50"
                                                    value={user.role}
                                                    onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                                                    disabled={updatingUserId === user._id || isCurrentUser}
                                                >
                                                    <option value="customer">Customer</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                {updatingUserId === user._id && (
                                                    <Loader2 className="h-4 w-4 animate-spin inline ml-2" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                                    disabled={isCurrentUser}
                                                    title={isCurrentUser ? "Cannot delete yourself" : "Delete user"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Help info */}
            <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border">
                <h3 className="font-semibold mb-2">Role Permissions:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li><strong>Customer:</strong> Can browse products, place orders, and track deliveries</li>

                    <li><strong>Admin:</strong> Full access to admin panel, products, orders, users, and settings</li>
                </ul>
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
