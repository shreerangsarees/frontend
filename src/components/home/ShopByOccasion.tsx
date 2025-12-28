import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/apiConfig';
import { ArrowRight, Sparkles } from 'lucide-react';

interface OccasionCategory {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    color?: string;
}

const ShopByOccasion = () => {
    const navigate = useNavigate();
    const [occasions, setOccasions] = useState<OccasionCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOccasions = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/categories/occasions`);
                if (res.ok) {
                    const data = await res.json();
                    setOccasions(data);
                }
            } catch (error) {
                console.error('Error fetching occasions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOccasions();
    }, []);

    // Don't render section if no occasion categories
    if (!loading && occasions.length === 0) {
        return null;
    }

    return (
        <section className="py-12 bg-white">
            <div className="container-app">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-foreground">Shop by Occasion</h2>
                        <p className="text-muted-foreground mt-1">Find the perfect saree for every moment</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {occasions.map((item) => (
                            <div
                                key={item._id}
                                onClick={() => navigate(`/category/${item._id}`)}
                                className={`
                                    group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300
                                    bg-gradient-to-br ${item.color || 'from-gray-700 to-gray-900'}
                                `}
                            >
                                {/* Background Image if available */}
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                                    />
                                )}

                                {/* Overlay Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent ${item.image ? 'opacity-90' : 'opacity-40'}`} />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="mb-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-foreground transition-colors">{item.name}</h3>
                                    <p className="text-white/80 text-sm mb-4 line-clamp-1">{item.description || 'Explore our collection'}</p>

                                    <div className="flex items-center text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                        Explore <ArrowRight className="ml-2 h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ShopByOccasion;

