
import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Grid3X3, List, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSocket } from '@/context/SocketContext';
import { Product } from '@/types';
import { useSearchParams } from 'react-router-dom';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { socket } = useSocket();

  // State from URL or local default
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category') || null);
  const [selectedColor, setSelectedColor] = useState<string | null>(searchParams.get('color') || null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'rating'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');


  // Pagination state
  const [displayCount, setDisplayCount] = useState(12);
  const [hasMore, setHasMore] = useState(false);
  const [allFilteredProducts, setAllFilteredProducts] = useState<Product[]>([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [refetchTrigger]);

  // Real-time updates from admin
  useEffect(() => {
    if (socket) {
      const handleProductChange = () => {
        setRefetchTrigger(prev => prev + 1);
      };
      const handleCategoryChange = () => {
        setRefetchTrigger(prev => prev + 1);
      };

      socket.on('productCreated', handleProductChange);
      socket.on('productUpdated', handleProductChange);
      socket.on('productDeleted', handleProductChange);
      socket.on('categoryCreated', handleCategoryChange);
      socket.on('categoryUpdated', handleCategoryChange);
      socket.on('categoryDeleted', handleCategoryChange);

      return () => {
        socket.off('productCreated', handleProductChange);
        socket.off('productUpdated', handleProductChange);
        socket.off('productDeleted', handleProductChange);
        socket.off('categoryCreated', handleCategoryChange);
        socket.off('categoryUpdated', handleCategoryChange);
        socket.off('categoryDeleted', handleCategoryChange);
      };
    }
  }, [socket]);

  // Sync State FROM URL (Handle navigation/banner clicks)
  useEffect(() => {
    const cat = searchParams.get('category');
    const search = searchParams.get('search');
    const color = searchParams.get('color');

    if (cat !== selectedCategory) setSelectedCategory(cat);
    if (search !== null && search !== searchQuery) setSearchQuery(search);
    if (color !== selectedColor) setSelectedColor(color);
  }, [searchParams]);

  // Update URL function (Triggered by UI changes)
  const updateUrl = (newCategory: string | null, newSearch: string, newColor: string | null) => {
    const params: any = {};
    if (newSearch) params.search = newSearch;
    if (newCategory) params.category = newCategory;
    if (newColor) params.color = newColor;
    setSearchParams(params);
  };

  // Replace existing separate useEffect for URL updates with direct calls or keep as is?
  // Keeping the existing "State -> URL" effect might cause loops with the new "URL -> State" effect.
  // Safest is to remove the "State -> URL" effect and update URL in handlers, 
  // OR ensure the dependency arrays and checks prevent loops.
  // The checks `if (cat !== selectedCategory)` above prevent infinite loops.

  // Using the existing effect for State -> URL is fine given the checks.

  // Update URL when filters change
  useEffect(() => {
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedColor) params.color = selectedColor;
    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedColor, setSearchParams]);

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
          const query = searchQuery.toLowerCase().trim();
          filtered = filtered.filter((p: any) =>
            p.name?.toLowerCase().trim().includes(query) ||
            p.description?.toLowerCase().trim().includes(query)
          );
        }

        if (selectedCategory && selectedCategory !== 'all') {
          // Resolve ID to Name if possible (handle links that use ID)
          const matchedCat = categories.find(c => c._id === selectedCategory);
          const filterValue = matchedCat ? matchedCat.name : selectedCategory;

          const catLower = filterValue.toLowerCase().trim();

          filtered = filtered.filter((p: any) =>
            p.category?.toLowerCase().trim() === catLower ||
            (Array.isArray(p.categories) && p.categories.some((c: string) => c.toLowerCase().trim() === catLower))
          );
        }

        if (selectedColor) {
          const sColor = selectedColor.toLowerCase().trim();
          filtered = filtered.filter((p: any) =>
            p.color?.toLowerCase().trim() === sColor ||
            (Array.isArray(p.colors) && p.colors.some((c: string) => c.toLowerCase().trim() === sColor))
          );
        }

        // Sort and Map
        let sorted = [...filtered];
        switch (sortBy) {
          case 'name':
            sorted.sort((a: any, b: any) => a.name.localeCompare(b.name));
            break;
          case 'price-low':
            sorted.sort((a: any, b: any) => a.price - b.price);
            break;
          case 'price-high':
            sorted.sort((a: any, b: any) => b.price - a.price);
            break;
          case 'rating':
            sorted.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
            break;
        }

        const mappedProducts = sorted.map((p: any) => ({
          ...p,
          id: p.id || p._id, // Handle MongoDB _id
          category: p.category || 'General',
          isAvailable: p.isAvailable,
          originalPrice: p.original_price,
          isNew: p.is_new,
        }));

        setAllFilteredProducts(mappedProducts);
        setProducts(mappedProducts.slice(0, displayCount));
        setHasMore(mappedProducts.length > displayCount);

      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    setDisplayCount(12); // Reset display count on filter change
  }, [searchQuery, selectedCategory, selectedColor, sortBy, refetchTrigger, categories]);

  // Update displayed products when displayCount changes
  useEffect(() => {
    setProducts(allFilteredProducts.slice(0, displayCount));
    setHasMore(allFilteredProducts.length > displayCount);
  }, [displayCount, allFilteredProducts]);

  const loadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedColor(null);
    setSortBy('name');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedColor;

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
              placeholder="Search sarees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-search"
            />
          </div>

          {/* Filter & Sort controls */}
          <div className="flex items-center gap-2">
            {/* Mobile Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="sm:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Filter products by category.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Categories</h3>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant={selectedCategory === null && selectedColor === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setSelectedCategory(null); setSelectedColor(null); }}
                        className="justify-start"
                      >
                        All Products
                      </Button>
                      {categories.map(cat => (
                        <Button
                          key={cat._id}
                          variant={selectedCategory === cat.name ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory(cat.name)}
                          className="justify-start"
                        >
                          {cat.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

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
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2.5 transition-colors",
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="hidden sm:flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === null && selectedColor === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSelectedCategory(null); setSelectedColor(null); }}
          >
            All
          </Button>

          {selectedColor && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setSelectedColor(null)}
              className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
            >
              Color: {selectedColor} <X className="ml-1 h-3 w-3" />
            </Button>
          )}

          {categories.map(cat => (
            <Button
              key={cat._id}
              variant={selectedCategory === cat.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div
              className={cn(
                "gap-3 sm:gap-6",
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

            {/* Load More Section */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Showing {products.length} of {allFilteredProducts.length} products
              </p>
              {hasMore && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  className="min-w-[200px]"
                >
                  Load More Products
                </Button>
              )}
            </div>
          </>
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
