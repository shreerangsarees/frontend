import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Category {
  _id: string;
  name: string;
  image: string;
  icon?: string;
  productCount: number;
}

// Palette for category cards to give distinct variety
const CARD_COLORS = [
  "bg-red-50 hover:bg-red-100",
  "bg-orange-50 hover:bg-orange-100",
  "bg-amber-50 hover:bg-amber-100",
  "bg-rose-50 hover:bg-rose-100",
  "bg-stone-50 hover:bg-stone-100",
  "bg-pink-50 hover:bg-pink-100"
];

const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-8 bg-background">
      <div className="container-app">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
            Shop by Category
          </h2>
          <Link to="/categories" className="text-primary text-sm font-semibold hover:underline flex items-center">
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.slice(0, 6).map((category, index) => (
              <Link
                key={category._id || index}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${CARD_COLORS[index % CARD_COLORS.length]} border border-border/50 min-h-[100px]`}
              >
                {/* Text content - constrained width to avoid image */}
                <div className="relative z-10 pr-2 pb-2 max-w-[65%]">
                  <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight line-clamp-2">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.productCount || 0} Items
                  </p>
                </div>

                {/* Image positioned absolute bottom-right */}
                <div className="absolute top-0 right-0 h-full w-[40%] sm:w-[45%]">
                  {category.image ? (
                    <>
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover mask-image-gradient"
                        style={{ maskImage: 'linear-gradient(to right, transparent, black 20%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%)' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.png';
                        }}
                      />
                    </>
                  ) : (
                    <div className="h-full w-full bg-black/5 flex items-center justify-center">
                      <img src="/logo.png" alt="Placeholder" className="h-8 w-8 opacity-20 filter grayscale" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;

