import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { Product } from '@/types';

interface ProductCarouselProps {
    title: string;
    description?: string;
    apiUrl: string;
    linkUrl?: string;
    icon?: React.ElementType;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, description, apiUrl, linkUrl, icon: Icon }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Add minimum delay to show skeleton prevents flicker
                const [response] = await Promise.all([
                    fetch(apiUrl),
                    new Promise(resolve => setTimeout(resolve, 1000))
                ]);

                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error(`Error fetching ${title}:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl]);

    if (!loading && products.length === 0) return null;

    return (
        <section className="py-12 border-b border-border/50">
            <div className="container-app">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                                <Icon className="h-5 w-5 text-primary-foreground" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                                {title}
                            </h2>
                            {description && (
                                <p className="text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    {linkUrl && (
                        <Link
                            to={linkUrl}
                            className="hidden sm:flex items-center gap-1 text-primary font-medium hover:underline group"
                        >
                            View All
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                </div>

                {/* Products grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {products.map((product, index) => (
                            <div
                                key={product._id || product.id}
                                className="opacity-0 animate-scale-in"
                                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                            >
                                <ProductCard product={{
                                    ...product,
                                    id: product._id || product.id,
                                    // Ensure fallbacks for optional fields from different endpoints
                                    name: product.name,
                                    image: product.image,
                                    price: product.price,
                                    originalPrice: product.original_price || product.originalPrice, // Map DB snake_case
                                    category: product.category,
                                    rating: product.averageRating || product.rating,
                                    discount: product.discount, // Check if this needs calculation
                                    stock: product.stock,
                                    isNew: product.is_new || product.isNew,
                                    isAvailable: product.is_available ?? product.isAvailable ?? true
                                }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductCarousel;
