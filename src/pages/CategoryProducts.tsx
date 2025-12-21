import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

interface Category {
  id: string;
  name: string;
  image: string;
  itemCount: number;
}

const CategoryProducts: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState(categoryId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      setLoading(true);
      try {
        // Fetch products for category - Filter logic client side or API side?
        // Using existing /api/products and filtering for now since we don't have a dedicated category endpoint yet,
        // or we use query param if supported. Let's filter client side for MVP.
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          // Filter
          const filtered = data.filter((p: any) => p.category === categoryId).map((p: any) => ({
            ...p,
            id: p._id || p.id,
            category: p.category || 'General',
            isAvailable: p.isAvailable,
            originalPrice: p.original_price,
            isNew: p.is_new,
          }));
          setProducts(filtered);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    setCategoryName(categoryId);
  }, [categoryId]);

  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-coral" /></div></Layout>;

  return (
    <Layout>
      <div className="container-app py-6 sm:py-8">
        {/* Back button */}
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>

        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground flex items-center gap-2">
              {categoryName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {products.length} products available
            </p>
          </div>
        </div>

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="opacity-0 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              No products in this category yet
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryProducts;
