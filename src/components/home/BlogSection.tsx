
import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/dateUtils';

interface Blog {
    _id: string;
    title: string;
    excerpt: string;
    image: string;
    createdAt: string;
}

const BlogSection: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch('/api/blogs');
                if (res.ok) {
                    const data = await res.json();
                    console.log('Fetched blogs:', data);
                    setBlogs(data);
                } else {
                    console.error('Failed response from /api/blogs');
                }
            } catch (error) {
                console.error("Failed to load blogs", error);
            }
        };
        fetchBlogs();
    }, []);

    if (blogs.length === 0) return null;

    return (
        <section className="py-8 sm:py-16 bg-white">
            <div className="container-app">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-display font-bold">Latest form Blog</h2>
                    <Link to="/blogs" className="text-primary font-medium hover:underline flex items-center text-sm sm:text-base">
                        Read All <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    {blogs.slice(0, 3).map((blog) => (
                        <article key={blog._id} className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-border">
                            <div className="aspect-video overflow-hidden">
                                <img
                                    src={blog.image}
                                    alt={blog.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(blog.createdAt)}
                                </div>
                                <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                    {blog.title}
                                </h3>
                                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                    {blog.excerpt}
                                </p>
                                <Link to={`/blog/${blog._id}`} className="text-sm font-semibold text-primary hover:underline">
                                    Read Article
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
