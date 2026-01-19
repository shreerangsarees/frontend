import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { API_BASE_URL } from '@/apiConfig';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

interface Category {
  id: string;
  name: string;
  image: string;
  itemCount: number;
}

import { useSocket } from '@/context/SocketContext';

// ... (imports remain the same)

const CategoryProducts: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState(categoryId);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Real-time updates
  useEffect(() => {
    if (socket) {
      const handleProductChange = () => {
        setRefetchTrigger(prev => prev + 1);
      };

      socket.on('productCreated', handleProductChange);
      socket.on('productUpdated', handleProductChange);
      socket.on('productDeleted', handleProductChange);

      return () => {
        socket.off('productCreated', handleProductChange);
        socket.off('productUpdated', handleProductChange);
        socket.off('productDeleted', handleProductChange);
      };
    }
  }, [socket]);

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      setLoading(true);
      try {
        // First, try to get category details by ID to get the actual name
        let actualCategoryName = decodeURIComponent(categoryId);

        try {
          const catRes = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
          if (catRes.ok) {
            const catData = await catRes.json();
            actualCategoryName = catData.name || actualCategoryName;
          }
        } catch (e) {
          // If category fetch fails, use the URL param directly (might be name)
          // Using URL param as category name
        }

        setCategoryName(actualCategoryName);

        // Now fetch products and filter by category name (case-insensitive)
        const res = await fetch(`${API_BASE_URL}/products?limit=0`);
        if (res.ok) {
          const data = await res.json();
          const products = Array.isArray(data) ? data : (data.products || []);
          const filtered = products
            .filter((p: any) =>
              p.category?.toLowerCase() === actualCategoryName.toLowerCase()
            )
            .map((p: any) => ({
              ...p,
              id: p._id || p.id,
              category: p.category || 'General',
              isAvailable: p.isAvailable,
              originalPrice: p.original_price,
              isNew: p.is_new,
            }));
          setProducts(filtered);
          // Found products for category
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId, refetchTrigger]);

  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div></Layout>;

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
