import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, MessageSquare, Eye, EyeOff, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';

interface Testimonial {
    _id: string;
    name: string;
    avatar?: string;
    rating: number;
    comment: string;
    location?: string;
    isActive: boolean;
}

const AdminTestimonials: React.FC = () => {
    const { socket } = useSocket();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        avatar: '',
        rating: 5,
        comment: '',
        location: '',
        isActive: true
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    // Real-time updates
    useEffect(() => {
        if (socket) {
            socket.on('testimonialCreated', (testimonial: Testimonial) => {
                setTestimonials(prev => [testimonial, ...prev]);
            });
            socket.on('testimonialUpdated', (testimonial: Testimonial) => {
                setTestimonials(prev => prev.map(t => t._id === testimonial._id ? testimonial : t));
            });
            socket.on('testimonialDeleted', ({ testimonialId }: { testimonialId: string }) => {
                setTestimonials(prev => prev.filter(t => t._id !== testimonialId));
            });

            return () => {
                socket.off('testimonialCreated');
                socket.off('testimonialUpdated');
                socket.off('testimonialDeleted');
            };
        }
    }, [socket]);

    const fetchTestimonials = async () => {
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch('/api/testimonials/admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTestimonials(data);
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.comment) {
            toast.error('Name and Comment are required');
            return;
        }

        try {
            const token = localStorage.getItem('tmart_token');
            const url = editingTestimonial ? `/api/testimonials/${editingTestimonial._id}` : '/api/testimonials';
            const method = editingTestimonial ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingTestimonial ? 'Testimonial updated!' : 'Testimonial created!');
                resetForm();
                if (!socket) fetchTestimonials();
            } else {
                toast.error('Failed to save testimonial');
            }
        } catch (error) {
            toast.error('Error saving testimonial');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this testimonial?')) return;

        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`/api/testimonials/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Testimonial deleted');
                if (!socket) fetchTestimonials();
            }
        } catch (error) {
            toast.error('Error deleting testimonial');
        }
    };

    const toggleActive = async (testimonial: Testimonial) => {
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`/api/testimonials/${testimonial._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...testimonial, isActive: !testimonial.isActive })
            });
            if (res.ok) {
                toast.success(testimonial.isActive ? 'Testimonial hidden' : 'Testimonial visible');
                if (!socket) fetchTestimonials();
            }
        } catch (error) {
            toast.error('Error updating testimonial');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', avatar: '', rating: 5, comment: '', location: '', isActive: true });
        setEditingTestimonial(null);
        setShowForm(false);
    };

    const startEdit = (testimonial: Testimonial) => {
        setFormData({
            name: testimonial.name,
            avatar: testimonial.avatar || '',
            rating: testimonial.rating,
            comment: testimonial.comment,
            location: testimonial.location || '',
            isActive: testimonial.isActive
        });
        setEditingTestimonial(testimonial);
        setShowForm(true);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Testimonials</h1>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Testimonial
                    </Button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-card rounded-xl border border-border p-6">
                        <h2 className="font-semibold mb-4">{editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}</h2>
                        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Customer Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Priya Sharma"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Location</label>
                                <Input
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Mumbai, Maharashtra"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Avatar URL (optional)</label>
                                <Input
                                    value={formData.avatar}
                                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Rating</label>
                                <div className="flex gap-1 pt-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-6 w-6 cursor-pointer transition-colors ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                                                }`}
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Comment *</label>
                                <textarea
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    placeholder="Amazing sarees! The quality is excellent..."
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background min-h-[100px] resize-none"
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-2">
                                <Button type="submit">
                                    {editingTestimonial ? 'Update' : 'Create'} Testimonial
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Testimonials List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : testimonials.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No testimonials yet. Add your first one!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial._id} className="bg-card rounded-xl border border-border p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {testimonial.avatar ? (
                                            <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                                {testimonial.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">{testimonial.name}</p>
                                            {testimonial.location && <p className="text-xs text-muted-foreground">{testimonial.location}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => toggleActive(testimonial)}>
                                            {testimonial.isActive ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => startEdit(testimonial)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(testimonial._id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex gap-0.5 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`h-4 w-4 ${star <= testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">{testimonial.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminTestimonials;
