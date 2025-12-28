import React, { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';
import { API_BASE_URL } from '@/apiConfig';
import { Button } from '@/components/ui/button';

const InstagramSection: React.FC = () => {
    const [instaUrl, setInstaUrl] = useState('');
    const [posts, setPosts] = useState<{ imageUrl: string; postUrl: string }[]>([]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setInstaUrl(data.instagramUrl);
                    if (data.instagramPosts && data.instagramPosts.length > 0) {
                        setPosts(data.instagramPosts);
                    } else {
                        // Fallback defaults
                        setPosts([
                            { imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80", postUrl: data.instagramUrl },
                            { imageUrl: "https://images.unsplash.com/photo-1583391733958-e026f554ac64?w=400&q=80", postUrl: data.instagramUrl },
                            { imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80", postUrl: data.instagramUrl },
                            { imageUrl: "https://images.unsplash.com/photo-1549488344-c1a5905d2146?w=400&q=80", postUrl: data.instagramUrl }
                        ]);
                    }
                }
            } catch (error) {
                console.error("Failed to load settings");
            }
        };
        fetchSettings();
    }, []);

    if (!instaUrl) return null;

    return (
        <section className="py-12 bg-pink-50/50">
            <div className="container-app text-center">
                <div className="flex items-center justify-center gap-2 mb-2 text-primary">
                    <Instagram className="h-5 w-5" />
                    <span className="font-bold uppercase tracking-widest text-sm">@shreerang.saree</span>
                </div>
                <h2 className="text-3xl font-display font-bold mb-8">Follow Us On Instagram</h2>

                <div className="flex flex-wrap justify-center gap-4">
                    {posts.map((post, i) => (
                        <a
                            key={i}
                            href={post.postUrl || instaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-square w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)] overflow-hidden rounded-xl"
                        >
                            <img src={post.imageUrl} alt="Instagram Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Instagram className="text-white h-8 w-8" />
                            </div>
                        </a>
                    ))}
                </div>

                <div className="mt-8">
                    <a
                        href={instaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        <Instagram className="h-5 w-5" />
                        Follow Now
                    </a>
                </div>
            </div>
        </section>
    );
};

export default InstagramSection;
