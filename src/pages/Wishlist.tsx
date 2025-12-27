import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Wishlist: React.FC = () => {
    const { user } = useAuth();
    const { wishlist, loading, removeFromWishlist } = useWishlist();
    const { addItem, getItemQuantity } = useCart();
    const navigate = useNavigate();

    const handleAddToCart = (product: any) => {
        addItem({
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            description: product.description || '',
            stock: product.stock,
            isAvailable: product.stock > 0
        });
        toast.success('Added to cart');
    };

    if (!user) {
        return (
            <Layout>
                <div className="container-app py-16 text-center">
                    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Your Wishlist</h1>
                    <p className="text-muted-foreground mb-6">Please login to view your wishlist.</p>
                    <Link to="/auth">
                        <Button variant="hero">Login</Button>
                    </Link>
                </div>
            </Layout>
        );
    }

    if (loading) {
        return (
            <Layout>
                <div className="container-app py-16 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container-app py-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Heart className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold">My Wishlist</h1>
                        <p className="text-muted-foreground">{wishlist.length} items saved</p>
                    </div>
                </div>

                {wishlist.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border">
                        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
                        <p className="text-muted-foreground mb-6">Save items you love to buy later</p>
                        <Link to="/products">
                            <Button variant="hero">Browse Products</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <div key={product._id} className="bg-card rounded-xl border border-border overflow-hidden group">
                                <Link to={`/ product / ${product._id} `}>
                                    <div className="aspect-square bg-white p-4 relative">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                        />
                                        {product.stock <= 0 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white font-semibold">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <div className="p-4">
                                    <Link to={`/ product / ${product._id} `}>
                                        <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                                            {product.name}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                                    <p className="text-lg font-bold text-primary mb-4">₹{product.price}</p>
                                    <div className="flex gap-2">
                                        {getItemQuantity(product._id) > 0 ? (
                                            <Button
                                                className="w-full gap-2"
                                                variant="secondary"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate('/cart');
                                                }}
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                                Go to Cart
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full gap-2"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleAddToCart(product);
                                                }}
                                                disabled={!product.stock || product.stock <= 0}
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                                {(!product.stock || product.stock <= 0) ? 'Out of Stock' : 'Add to Cart'}
                                            </Button>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                removeFromWishlist(product._id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Wishlist;
