import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Star, ArrowLeft, Loader2, Check, Minus, Plus, Trash2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import ProductCard from '@/components/products/ProductCard';
import ReviewSection from '@/components/product/ReviewSection';
import ImageGallery from '@/components/product/ImageGallery';
import ShareButtons from '@/components/product/ShareButtons';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    images?: string[];
    colors?: string[];
    category: string;
    categories?: string[];
    stock: number;
    averageRating: number;
    rating: number;
    reviewCount: number;
    salesCount: number;
    unit?: string;
}

const ProductDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addedToCart, setAddedToCart] = useState(false);
    const { addItem, updateQuantity, getItemQuantity, removeItem } = useCart();
    const { addToRecentlyViewed } = useRecentlyViewed();
    const [visibleItems, setVisibleItems] = useState(4);
    const [selectedColor, setSelectedColor] = useState<string>('');

    // Get real-time quantity from cart
    // Force 0 quantity if colors are required but not selected (to show Add to Cart which validates selection)
    // Otherwise fetch specific variant quantity
    const currentQty = product ?
        ((product.colors && product.colors.length > 0 && !selectedColor)
            ? 0
            : getItemQuantity(product._id, selectedColor || undefined)
        ) : 0;

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data);
                // Add to recently viewed
                addToRecentlyViewed({
                    id: data._id,
                    name: data.name,
                    image: data.image,
                    price: data.price,
                    category: data.category
                });
                // Fetch suggested products from same category
                fetchSuggestedProducts(data.category, data._id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ... (existing code)

    const fetchSuggestedProducts = async (category: string, currentId: string) => {
        try {
            // Add limit=0 to ensure we get all products as an array
            const res = await fetch(`/api/products?category=${encodeURIComponent(category)}&limit=0`);
            if (res.ok) {
                const data = await res.json();
                // Handle both array and object responses
                const products = Array.isArray(data) ? data : (data.products || []);
                // Filter out current product
                let filtered = products.filter((p: any) => p._id !== currentId);

                // Fallback: If no same-category products, show some from other categories
                if (filtered.length === 0) {
                    const allRes = await fetch('/api/products?limit=0');
                    if (allRes.ok) {
                        const allData = await allRes.json();
                        const allProducts = Array.isArray(allData) ? allData : (allData.products || []);
                        filtered = allProducts.filter((p: any) => p._id !== currentId).slice(0, 8);
                    }
                }

                setSuggestedProducts(filtered);
                console.log('Suggested products loaded:', filtered.length);
            }
        } catch (error) {
            console.error('Error fetching suggested products:', error);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            // Require color selection if product has colors
            if (product.colors && product.colors.length > 0 && !selectedColor) {
                toast.error('Please select a color');
                return;
            }
            if (addItem({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                description: product.description,
                stock: product.stock,
                isAvailable: product.stock > 0,
                selectedColor: selectedColor || undefined,
                colors: product.colors
            })) {
                // Only change state if successfully added
                setAddedToCart(true);
            }
            // Toast is handled by addItem context method now
        }
    };

    if (loading) return (
        <Layout>
            <div className="container-app py-8">
                <Skeleton className="h-4 w-32 mb-6" />
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="aspect-square w-full rounded-2xl" />
                        <div className="flex gap-2">
                            <Skeleton className="h-20 w-20 rounded-lg" />
                            <Skeleton className="h-20 w-20 rounded-lg" />
                            <Skeleton className="h-20 w-20 rounded-lg" />
                        </div>
                    </div>
                    {/* Info Skeleton */}
                    <div className="space-y-6">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-10 w-32" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                        <div className="space-y-3 pt-4">
                            <Skeleton className="h-8 w-24" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-20 rounded-full" />
                                <Skeleton className="h-10 w-20 rounded-full" />
                            </div>
                        </div>
                        <div className="pt-8 flex gap-4">
                            <Skeleton className="h-14 flex-1 rounded-xl" />
                            <Skeleton className="h-14 w-14 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
    if (!product) return <Layout><div className="text-center py-20">Product not found</div></Layout>;

    const displayRating = product.rating || product.averageRating || 0;

    return (
        <Layout>
            <div className="container-app py-8 pb-24 md:pb-8">
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                </Link>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image */}
                    <ImageGallery
                        images={product.images && product.images.length > 0 ? product.images : [product.image]}
                        name={product.name}
                    />

                    {/* Info */}
                    <div>
                        <div className="mb-2">
                            <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                                {product.category}
                            </span>
                        </div>
                        <h1 className="text-4xl font-display font-bold text-foreground mb-4">{product.name}</h1>

                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-yellow-500">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={`h-5 w-5 ${star <= Math.round(displayRating) ? 'fill-current' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {displayRating > 0 ? displayRating.toFixed(1) : 'No ratings'}
                                ({product.reviewCount || 0} reviews)
                            </span>
                            {product.salesCount > 50 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">Highly Ordered</span>
                            )}
                        </div>

                        <p className="text-3xl font-bold text-primary mb-6">₹{product.price}<span className="text-lg text-muted-foreground font-normal ml-1">/{product.unit || 'unit'}</span></p>

                        <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

                        {/* Stock Status */}
                        <div className="mb-6">
                            {product.stock > 10 ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <Check className="h-4 w-4 mr-1.5" /> In Stock ({product.stock} available)
                                </span>
                            ) : product.stock > 0 ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 animate-pulse">
                                    Hurry! Only {product.stock} units left!
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold mb-3">Select Color</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${selectedColor === color
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-background border-border hover:border-primary'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                                {selectedColor && (
                                    <p className="text-sm text-muted-foreground mt-2">Selected: <span className="font-medium text-foreground">{selectedColor}</span></p>
                                )}
                            </div>
                        )}

                        {/* Share Buttons */}
                        <div className="mb-8">
                            <ShareButtons
                                url={`${window.location.origin}/product/${product._id}`}
                                title={`Check out ${product.name} at Shreerang Saree!`}
                                description={product.description}
                                image={product.image}
                            />
                        </div>

                        {/* Add to Cart / Go to Cart buttons */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:static md:p-0 md:bg-transparent md:border-0 md:shadow-none z-50">
                            <div className="flex gap-4 container-app md:px-0">
                                {currentQty === 0 ? (
                                    <Button
                                        size="lg"
                                        variant="hero"
                                        onClick={handleAddToCart}
                                        className="w-full h-14 text-lg shadow-xl"
                                        disabled={!product.stock || product.stock <= 0}
                                    >
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        {(!product.stock || product.stock <= 0) ? 'Out of Stock' : 'Add to Cart'}
                                    </Button>
                                ) : (
                                    <>
                                        {/* Quantity Selector */}
                                        <div className="flex items-center justify-between bg-muted/50 rounded-xl h-14 px-4 w-full sm:w-auto flex-1 border border-border">
                                            <button
                                                onClick={() => {
                                                    if (currentQty > 1) {
                                                        updateQuantity(product._id, currentQty - 1, selectedColor || undefined);
                                                    } else {
                                                        removeItem(product._id, selectedColor || undefined);
                                                    }
                                                }}
                                                className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-white hover:text-destructive hover:shadow-sm transition-all text-foreground"
                                            >
                                                {currentQty > 1 ? <Minus className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                                            </button>
                                            <span className="text-lg font-bold w-8 text-center">{currentQty}</span>
                                            <button
                                                onClick={() => updateQuantity(product._id, currentQty + 1, selectedColor || undefined)}
                                                className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-primary"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <Button
                                            size="lg"
                                            variant="hero"
                                            onClick={() => navigate('/cart')}
                                            className="flex-1 h-14 text-base sm:text-lg px-2 sm:px-8 shadow-xl"
                                        >
                                            <Check className="h-5 w-5 mr-1 sm:mr-2" />
                                            Go to Cart
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section - New Component */}
                <ReviewSection productId={product._id} productName={product.name} />

                {/* Suggested Products Section */}
                {suggestedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-display font-bold mb-8">You May Also Like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            {suggestedProducts.slice(0, visibleItems).map((p) => (
                                <ProductCard
                                    key={p._id}
                                    product={{
                                        id: p._id,
                                        name: p.name,
                                        price: p.price,
                                        image: p.image,
                                        category: p.category,
                                        description: p.description,
                                        stock: p.stock,
                                        isAvailable: p.stock > 0,
                                        rating: p.rating || p.averageRating
                                    }}
                                />
                            ))}
                        </div>

                        {visibleItems < suggestedProducts.length && (
                            <div className="flex justify-center pb-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setVisibleItems(prev => prev + 4)}
                                    className="min-w-[200px]"
                                >
                                    Show More
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProductDetails;

