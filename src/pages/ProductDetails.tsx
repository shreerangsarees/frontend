import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, Star, ArrowLeft, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import ProductCard from '@/components/products/ProductCard';

interface Review {
    user: string;
    name: string;
    rating: number;
    review: string;
    date: string;
}

interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
    stock: number;
    averageRating: number;
    ratings: Review[];
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
    const { addItem } = useCart();
    const { user } = useAuth();

    // Rating State
    const [newRating, setNewRating] = useState(5);
    const [newReview, setNewReview] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchProduct();
        setAddedToCart(false); // Reset when product changes
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data);
                // Fetch suggested products from same category
                fetchSuggestedProducts(data.category, data._id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestedProducts = async (category: string, currentId: string) => {
        try {
            const res = await fetch(`/api/products?category=${encodeURIComponent(category)}`);
            if (res.ok) {
                const data = await res.json();
                // Filter out current product and limit to 4
                const filtered = data.filter((p: any) => p._id !== currentId).slice(0, 4);
                setSuggestedProducts(filtered);
            }
        } catch (error) {
            console.error('Error fetching suggested products:', error);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addItem({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                description: product.description,
                stock: product.stock,
                isAvailable: product.stock > 0
            });
            toast.success('Added to cart');
            setAddedToCart(true);
        }
    };

    const submitReview = async () => {
        if (!user) {
            toast.error('Please login to review');
            return;
        }
        setSubmittingReview(true);
        try {
            const res = await fetch(`/api/products/${id}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: newRating, review: newReview })
            });
            if (res.ok) {
                toast.success('Review submitted');
                fetchProduct();
                setNewReview('');
            } else {
                toast.error('Failed to submit review');
            }
        } catch (error) {
            toast.error('Error submitting review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-coral" /></div></Layout>;
    if (!product) return <Layout><div className="text-center py-20">Product not found</div></Layout>;

    return (
        <Layout>
            <div className="container-app py-8">
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                </Link>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image */}
                    <div className="bg-white rounded-3xl p-8 border border-border flex items-center justify-center">
                        <img src={product.image} alt={product.name} className="max-h-[400px] object-contain hover:scale-105 transition-transform duration-500" />
                    </div>

                    {/* Info */}
                    <div>
                        <div className="mb-2">
                            <span className="text-xs font-bold bg-coral/10 text-coral px-3 py-1 rounded-full uppercase tracking-wider">
                                {product.category}
                            </span>
                        </div>
                        <h1 className="text-4xl font-display font-bold text-foreground mb-4">{product.name}</h1>

                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-yellow-500">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={`h-5 w-5 ${star <= Math.round(product.averageRating || 0) ? 'fill-current' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">({product.ratings?.length || 0} reviews)</span>
                            {product.salesCount > 50 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">Highly Ordered</span>
                            )}
                        </div>

                        <p className="text-3xl font-bold text-coral mb-6">₹{product.price}<span className="text-lg text-muted-foreground font-normal ml-1">/{product.unit || 'unit'}</span></p>

                        <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

                        {/* Add to Cart / Go to Cart buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {!addedToCart ? (
                                <Button
                                    size="lg"
                                    variant="hero"
                                    onClick={handleAddToCart}
                                    className="flex-1 md:flex-none px-8"
                                    disabled={!product.stock || product.stock <= 0}
                                >
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    {(!product.stock || product.stock <= 0) ? 'Out of Stock' : 'Add to Cart'}
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={handleAddToCart}
                                        className="flex-1 md:flex-none px-8"
                                    >
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        Add More
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="hero"
                                        onClick={() => navigate('/cart')}
                                        className="flex-1 md:flex-none px-8"
                                    >
                                        <Check className="h-5 w-5 mr-2" />
                                        Go to Cart
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16 bg-card rounded-2xl border border-border p-8">
                    <h2 className="text-2xl font-display font-bold mb-8">Ratings & Reviews</h2>

                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Review Form */}
                        <div className="md:col-span-1">
                            <h3 className="font-bold mb-4">Write a Review</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} onClick={() => setNewRating(star)} type="button">
                                                <Star className={`h-8 w-8 ${star <= newRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Review</label>
                                    <textarea
                                        className="w-full p-3 rounded-lg border border-input bg-background min-h-[100px]"
                                        value={newReview}
                                        onChange={(e) => setNewReview(e.target.value)}
                                        placeholder="Share your thoughts..."
                                    />
                                </div>
                                <Button onClick={submitReview} disabled={submittingReview}>
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </Button>
                            </div>
                        </div>

                        {/* Review List */}
                        <div className="md:col-span-2 space-y-6">
                            {product.ratings?.length === 0 && <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>}
                            {product.ratings?.slice(0).reverse().map((review, i) => (
                                <div key={i} className="border-b border-border pb-6 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                                                {review.name?.[0] || 'U'}
                                            </div>
                                            <span className="font-bold">{review.name || 'User'}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex text-yellow-500 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <p className="text-foreground">{review.review}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Suggested Products Section */}
                {suggestedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-display font-bold mb-8">You May Also Like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {suggestedProducts.map((p) => (
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
                                        rating: p.averageRating
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProductDetails;
