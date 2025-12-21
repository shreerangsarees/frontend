import React, { useEffect, useState } from 'react';
import { Tag, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import { toast } from 'sonner';

const Offers: React.FC = () => {
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          const offers = data.filter((p: any) => p.discount || p.isNew || p.is_new).map((p: any) => ({
            ...p,
            id: p._id || p.id,
            category: p.category || 'General',
            isAvailable: p.isAvailable,
            originalPrice: p.original_price,
            isNew: p.is_new,
          }));
          setOfferProducts(offers);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load offers');
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  return (
    <Layout>
      <div className="container-app py-6 sm:py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-coral flex items-center justify-center">
            <Tag className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Special Offers
            </h1>
            <p className="text-muted-foreground mt-1">
              {offerProducts.length} deals available today
            </p>
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-coral" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {offerProducts.map((product, index) => (
              <div
                key={product.id}
                className="opacity-0 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Offers;
