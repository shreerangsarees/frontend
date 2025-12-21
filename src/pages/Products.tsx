import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Grid3X3, List, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
// import { categories } from '@/data/products'; // Removed
import { cn } from '@/lib/utils';

import { Product } from '@/types';
import { useSearchParams } from 'react-router-dom';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL or local default
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category') || null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'rating'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    setSearchParams(params);
  }, [searchQuery, selectedCategory, setSearchParams]);

  // Fetch products from API
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        // Client-side filtering
        let filtered = data;

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter((p: any) =>
            p.name?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
          );
        }

        if (selectedCategory && selectedCategory !== 'all') {
          filtered = filtered.filter((p: any) => p.category === selectedCategory);
        }

        // Sort and Map
        let sorted = [...filtered];
        switch (sortBy) {
          case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        }

        setProducts(sorted.map((p: any) => ({
          ...p,
          id: p.id || p._id, // Handle MongoDB _id
          category: p.category || 'General',
          isAvailable: p.isAvailable,
          originalPrice: p.original_price,
          isNew: p.is_new,
        })));

      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('name');
  };

  const hasActiveFilters = searchQuery || selectedCategory;

  return (
    <Layout>
      <div className="container-app py-6 sm:py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            All Products
          </h1>
          <p className="text-muted-foreground mt-1">
            {products.length} products available
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-search"
            />
          </div>

          {/* Filter & Sort controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-11 px-4 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            {/* View mode toggle */}
            <div className="hidden sm:flex items-center border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === 'grid' ? 'bg-coral text-primary-foreground' : 'hover:bg-muted'
                )}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === 'list' ? 'bg-coral text-primary-foreground' : 'hover:bg-muted'
                )}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className={cn(
          "flex flex-wrap gap-2 mb-6",
          showFilters ? 'block' : 'hidden sm:flex'
        )}>
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {['Vegetables', 'Fruits', 'Dairy', 'Beverages', 'Bakery', 'Snacks'].map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-coral" />
          </div>
        ) : products.length > 0 ? (
          <div
            className={cn(
              "gap-4 sm:gap-6",
              viewMode === 'grid'
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                : "flex flex-col"
            )}
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className="opacity-0 animate-scale-in"
                style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s`, animationFillMode: 'forwards' }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No products found</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
