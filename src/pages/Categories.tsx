import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
// CategoryCard is no longer used based on the new component logic
// import CategoryCard from '@/components/products/CategoryCard';
// Loader2 is replaced by a skeleton loader
// import { Loader2 } from 'lucide-react';

// The Category interface is implicitly defined by the usage in the new component,
// but for type safety, it could be:
// interface Category {
//   _id: string;
//   name: string;
//   image?: string;
//   icon?: string;
//   productCount?: number;
// }

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]); // Using any[] as per the provided snippet
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch categories:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="container-app py-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">All Categories</h1>
        <p className="text-muted-foreground mb-8">Browse products by category</p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group block bg-card rounded-2xl overflow-hidden border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center text-4xl">
                  {category.image && category.image.startsWith('http') ? (
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="group-hover:scale-110 transition-transform duration-300">{category.icon || '📦'}</span>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-foreground group-hover:text-coral transition-colors mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.productCount || 0} Products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
export default Categories;
