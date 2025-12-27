import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';

import { Product } from '@/types';

const FeaturedProducts: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const [response] = await Promise.all([
          fetch('http://localhost:5000/api/products/featured'),
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setFeaturedProducts(data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container-app">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                Featured Deals
              </h2>
              <p className="text-muted-foreground">
                Best offers handpicked for you
              </p>
            </div>
          </div>
          <Link
            to="/offers"
            className="hidden sm:flex items-center gap-1 text-primary font-medium hover:underline group"
          >
            View All Deals
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
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
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="opacity-0 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <ProductCard product={{
                  ...product,
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  image: product.image,
                  // Map joined category or fallback
                  category: (product as any).categories?.name || 'General',
                  stock: product.stock,
                  isAvailable: product.isAvailable,

                  // Map snake_case to camelCase
                  originalPrice: (product as any).original_price,
                  isNew: (product as any).is_new,
                  discount: product.discount,
                  rating: product.rating,
                  unit: product.unit
                }} />
              </div>
            ))}
          </div>
        )}

        {/* Mobile view all link */}
        <div className="mt-6 sm:hidden text-center">
          <Link
            to="/offers"
            className="inline-flex items-center gap-1 text-primary font-medium"
          >
            View All Deals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
