import React, { useEffect, useState } from 'react';
import { Percent, Tag, Timer, ShoppingBag, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/apiConfig';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';

const Offers: React.FC = () => {
  const { socket } = useSocket();
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Real-time updates from admin
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
    const fetchOffers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          // Filter products with discount or is_new flag
          const offers = data
            .filter((p: any) => (p.discount && p.discount > 0) || p.isNew || p.is_new)
            .map((p: any) => ({
              ...p,
              id: p._id || p.id,
              category: p.category || 'General',
              isAvailable: p.is_available !== false,
              originalPrice: p.original_price || p.originalPrice,
              isNew: p.is_new || p.isNew,
              stock: p.stock || 0,
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
  }, [refetchTrigger]);

  return (
    <Layout>
      <div className="container-app py-6 sm:py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
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
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : offerProducts.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">No offers available right now</h2>
            <p className="text-muted-foreground mb-4">Check back later for exciting deals!</p>
            <Link to="/products" className="text-primary hover:underline">Browse all products →</Link>
          </div>
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

