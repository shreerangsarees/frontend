import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, Plus, Trash2, Edit, TicketPercent, Tag, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '@/apiConfig';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/dateUtils';
import { useSocket } from '@/context/SocketContext';

interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'flat';
    discountAmount: number;
    minOrderValue: number;
    expiryDate: string;
    isActive: boolean;
}

const AdminCoupons: React.FC = () => {
    const { socket } = useSocket();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [code, setCode] = useState('');
    const [type, setType] = useState<'percentage' | 'flat'>('flat');
    const [amount, setAmount] = useState('');
    const [minOrder, setMinOrder] = useState('');
    const [expiry, setExpiry] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    // Real-time updates via Socket.io
    useEffect(() => {
        if (socket) {
            socket.on('couponCreated', () => fetchCoupons());
            socket.on('couponUpdated', () => fetchCoupons());
            socket.on('couponDeleted', () => fetchCoupons());

            return () => {
                socket.off('couponCreated');
                socket.off('couponUpdated');
                socket.off('couponDeleted');
            };
        }
    }, [socket]);

    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`${API_BASE_URL}/coupons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setCoupons(await res.json());
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`${API_BASE_URL}/coupons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code,
                    discountType: type,
                    discountAmount: Number(amount),
                    minOrderValue: Number(minOrder),
                    expiryDate: expiry
                })
            });

            if (res.ok) {
                toast.success('Coupon created');
                fetchCoupons();
                setCode('');
                setAmount('');
                setMinOrder('');
                setExpiry('');
            } else {
                toast.error('Failed to create coupon');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const token = localStorage.getItem('tmart_token');
            await fetch(`${API_BASE_URL}/coupons/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (error) {
            toast.error('Error deleting coupon');
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold font-display mb-8">Manage Coupons</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="bg-card p-6 rounded-xl border border-border h-fit">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        Create Coupon
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Code</label>
                            <Input
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                placeholder="SAVE50"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={type}
                                    onChange={(e: any) => setType(e.target.value)}
                                >
                                    <option value="flat">Flat (₹)</option>
                                    <option value="percentage">% Off</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Value</label>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="50"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Min Order (₹)</label>
                            <Input
                                type="number"
                                value={minOrder}
                                onChange={e => setMinOrder(e.target.value)}
                                placeholder="200"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Expiry</label>
                            <Input
                                type="date"
                                value={expiry}
                                onChange={e => setExpiry(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">Create Coupon</Button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <TicketPercent className="h-5 w-5 text-primary" />
                        Active Coupons
                    </h2>
                    {loading ? <p>Loading...</p> : coupons.length === 0 ? <p className="text-muted-foreground">No coupons found.</p> : (
                        <div className="grid gap-4">
                            {coupons.map(coupon => {
                                const isExpired = new Date(coupon.expiryDate) < new Date();
                                return (
                                    <div key={coupon._id} className={cn("bg-card p-4 rounded-xl border border-border flex justify-between items-center", isExpired && "opacity-60 bg-muted/30")}>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{coupon.code}</h3>
                                                {isExpired && (
                                                    <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold uppercase border border-destructive/20">
                                                        Expired
                                                    </span>
                                                )}
                                                {!isExpired && coupon.isActive === false && (
                                                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold uppercase">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {coupon.discountType === 'flat' ? `₹${coupon.discountAmount} OFF` : `${coupon.discountAmount}% OFF`}
                                                {' '}on orders above ₹{coupon.minOrderValue}
                                            </p>
                                            <p className={cn("text-xs mt-1", isExpired ? "text-destructive font-medium" : "text-muted-foreground")}>
                                                Expires: {formatDate(coupon.expiryDate)}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon._id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCoupons;
