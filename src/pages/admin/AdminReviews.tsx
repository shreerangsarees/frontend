import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, MessageSquare, Loader2, Star, X, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';

interface Review {
    id: string;
    product: string;
    productName?: string;
    user: string;
    userName: string;
    rating: number;
    title: string;
    comment: string;
    verified: boolean;
    adminReply?: string;
    adminReplyAt?: any;
    createdAt: any;
    images?: string[];
}

const AdminReviews: React.FC = () => {
    const { socket } = useSocket();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Reply Modal State
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch('/api/reviews', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setReviews(await res.json());
            } else {
                toast.error('Failed to fetch reviews');
            }
        } catch (error) {
            toast.error('Error fetching reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // Real-time updates via Socket.io
    useEffect(() => {
        if (socket) {
            socket.on('reviewAdded', () => fetchReviews());
            socket.on('reviewUpdated', () => fetchReviews());
            socket.on('reviewDeleted', () => fetchReviews());

            return () => {
                socket.off('reviewAdded');
                socket.off('reviewUpdated');
                socket.off('reviewDeleted');
            };
        }
    }, [socket]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`/api/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Review deleted');
                fetchReviews();
            }
        } catch (error) {
            toast.error('Error deleting review');
        }
    };

    const handleReplySubmit = async () => {
        if (!selectedReview || !replyText.trim()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`/api/reviews/${selectedReview.id}/reply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reply: replyText.trim() })
            });

            if (res.ok) {
                toast.success('Reply added successfully');
                setReplyModalOpen(false);
                setSelectedReview(null);
                setReplyText('');
                fetchReviews();
            } else {
                toast.error('Failed to add reply');
            }
        } catch (error) {
            toast.error('Error adding reply');
        } finally {
            setSubmitting(false);
        }
    };

    const openReplyModal = (review: Review) => {
        setSelectedReview(review);
        setReplyText(review.adminReply || '');
        setReplyModalOpen(true);
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateInput: any) => {
        if (!dateInput) return '';
        let date: Date;
        if (dateInput._seconds) {
            date = new Date(dateInput._seconds * 1000);
        } else {
            date = new Date(dateInput);
        }
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const filteredReviews = reviews.filter(r =>
        r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display font-bold text-foreground">Reviews</h1>
                        <p className="text-muted-foreground">Manage customer reviews and respond to feedback</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by user, product, or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none"
                    />
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block border border-border rounded-xl bg-card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50 text-left text-sm font-medium text-muted-foreground">
                            <tr>
                                <th className="p-4">Product</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Rating</th>
                                <th className="p-4">Review</th>
                                <th className="p-4">Reply</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
                            ) : filteredReviews.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No reviews found</td></tr>
                            ) : (
                                filteredReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-muted/30">
                                        <td className="p-4">
                                            <p className="font-medium text-sm truncate max-w-[150px]">{review.productName || 'Unknown'}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-medium text-sm">{review.userName}</p>
                                            {review.verified && (
                                                <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Verified</span>
                                            )}
                                        </td>
                                        <td className="p-4">{renderStars(review.rating)}</td>
                                        <td className="p-4">
                                            {review.title && <p className="font-medium text-sm">{review.title}</p>}
                                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{review.comment}</p>
                                            {review.images && review.images.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {review.images.map((img, i) => (
                                                        <img
                                                            key={i}
                                                            src={img}
                                                            alt="Review attachment"
                                                            className="h-8 w-8 rounded object-cover border border-border cursor-pointer hover:scale-110 transition-transform"
                                                            onClick={() => window.open(img, '_blank')}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {review.adminReply ? (
                                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Replied</span>
                                            ) : (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">No reply</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">{formatDate(review.createdAt)}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon-sm" onClick={() => openReplyModal(review)} title="Reply">
                                                    <MessageSquare className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(review.id)} title="Delete">
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

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground bg-card border border-border rounded-xl">No reviews found</div>
                    ) : (
                        filteredReviews.map((review) => (
                            <div key={review.id} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                                {/* Header: Product & Date */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-sm text-foreground">{review.productName || 'Unknown Product'}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {renderStars(review.rating)}
                                        {review.verified && (
                                            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Verified Purchase</span>
                                        )}
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-dashed">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium">{review.userName}</span>
                                </div>

                                {/* Content */}
                                <div className="mb-4">
                                    {review.title && <p className="font-bold text-sm mb-1">{review.title}</p>}
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{review.comment}</p>

                                    {/* Images */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {review.images.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img}
                                                    alt="Review attachment"
                                                    className="h-16 w-16 rounded-lg object-cover border border-border shrink-0"
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer & Actions */}
                                <div className="flex items-center justify-between pt-2 border-t mt-2">
                                    <div>
                                        {review.adminReply ? (
                                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" /> Replied
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full uppercase">Pending Reply</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openReplyModal(review)}>
                                            Reply
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => handleDelete(review.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Show existing reply preview if exists */}
                                {review.adminReply && (
                                    <div className="mt-3 bg-muted/30 p-2 rounded text-xs text-muted-foreground border border-border/50">
                                        <span className="font-bold text-foreground">You:</span> {review.adminReply}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Reply Modal */}
            {replyModalOpen && selectedReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Reply to Review</h2>
                            <Button variant="ghost" size="icon" onClick={() => setReplyModalOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Original Review */}
                        <div className="bg-muted/50 p-4 rounded-xl mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{selectedReview.userName}</span>
                                {renderStars(selectedReview.rating)}
                            </div>
                            {selectedReview.title && <p className="font-medium text-sm mb-1">{selectedReview.title}</p>}
                            <p className="text-sm text-muted-foreground">{selectedReview.comment}</p>
                            {selectedReview.images && selectedReview.images.length > 0 && (
                                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                    {selectedReview.images.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            alt="Review attachment"
                                            className="h-16 w-16 rounded-lg object-cover border border-border cursor-pointer"
                                            onClick={() => window.open(img, '_blank')}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reply Input */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Your Reply</label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write your response to this customer..."
                                    className="w-full p-3 rounded-lg border border-border bg-background min-h-[100px] resize-none"
                                />
                            </div>

                            <Button className="w-full" onClick={handleReplySubmit} disabled={submitting || !replyText.trim()}>
                                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                {selectedReview.adminReply ? 'Update Reply' : 'Send Reply'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminReviews;
