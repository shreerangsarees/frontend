import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Loader2, Save, FileText } from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Blog {
    _id: string;
    title: string;
    excerpt: string;
    image: string;
    createdAt?: string;
}

const AdminBlogs: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('tmart_token');
            const res = await fetch('/api/blogs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBlogs(data);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);

            const payload = {
                title: formData.get('title'),
                excerpt: formData.get('excerpt'),
                image: formData.get('image'),
            };

            const url = editingBlog
                ? `/api/blogs/${editingBlog._id}`
                : '/api/blogs';

            const method = editingBlog ? 'PUT' : 'POST';

            const token = localStorage.getItem('tmart_token');
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error('Failed to save blog');
            }

            toast.success(editingBlog ? 'Blog updated' : 'Blog created');
            setShowModal(false);
            fetchBlogs();
        } catch (error: any) {
            console.error(error);
            toast.error('Error saving blog');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog?')) return;
        try {
            const token = localStorage.getItem('tmart_token');
            const res = await fetch(`/api/blogs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Blog deleted');
            fetchBlogs();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting blog');
        }
    };

    const filteredBlogs = blogs.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-display">Blogs</h1>
                    <p className="text-muted-foreground">{blogs.length} posts</p>
                </div>
                <Button onClick={() => { setEditingBlog(null); setShowModal(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Blog Post
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search blogs..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Excerpt</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></td></tr>
                            ) : filteredBlogs.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No blogs found</td></tr>
                            ) : (
                                filteredBlogs.map(blog => (
                                    <tr key={blog._id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                                                    {blog.image ? (
                                                        <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" />
                                                    ) : <FileText className="h-5 w-5 text-muted-foreground" />}
                                                </div>
                                                <span className="font-medium text-foreground">{blog.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 max-w-xs truncate">{blog.excerpt}</td>
                                        <td className="px-4 py-3">
                                            {formatDate(blog.createdAt)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingBlog(blog); setShowModal(true); }}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(blog._id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">{editingBlog ? 'Edit Blog' : 'Add Blog'}</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}><X className="h-4 w-4" /></Button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Title</label>
                                <Input name="title" placeholder="Blog Title" defaultValue={editingBlog?.title} required />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Excerpt</label>
                                <textarea
                                    name="excerpt"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Short description..."
                                    defaultValue={editingBlog?.excerpt}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Image URL</label>
                                <Input name="image" placeholder="https://..." defaultValue={editingBlog?.image} required />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit">{editingBlog ? 'Update Blog' : 'Create Blog'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminBlogs;
