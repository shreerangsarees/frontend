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
    <section className="py-12 bg-background">
      <div className="container-app">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Shop by Category
          </h2>
          <Link to="/categories">
            <Button variant="ghost" className="text-coral hover:text-coral hover:bg-coral-light/20">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">No categories found.</p>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Admin: Go to Dashboard &gt; Categories to add some.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.slice(0, 6).map((category, index) => (
              <Link
                key={category._id || index}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group cursor-pointer"
              >
                <div className="bg-card rounded-2xl p-4 border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-center h-full">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-muted overflow-hidden flex items-center justify-center text-3xl">
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                    ) : category.icon ? (
                      <span>{category.icon}</span>
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-coral transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.productCount || 0} Products
                  </p>
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

