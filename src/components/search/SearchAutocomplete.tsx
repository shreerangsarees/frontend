import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { API_BASE_URL } from '@/apiConfig';
import { cn } from '@/lib/utils';

interface SearchResult {
    id: string;
    name: string;
    image: string;
    price: number;
    category: string;
}

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT = 5;

const getRecentSearches = (): string[] => {
    try {
        return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
    } catch {
        return [];
    }
};

const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const recent = getRecentSearches().filter(s => s !== query);
    recent.unshift(query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
};

const clearRecentSearches = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
};

interface SearchAutocompleteProps {
    placeholder?: string;
    className?: string;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
    placeholder = "Search for sarees...",
    className
}) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Typing animation state
    const [placeholderText, setPlaceholderText] = useState('Search for...');
    const phrases = ['Paithani Saree', 'Navwari Saree', 'Banarasi Silk', 'Kanjivaram', 'Cotton Saree', 'Bandhani Saree'];

    // Refs for animation state to survive re-renders without closure issues
    const stateRef = useRef({
        currentPhraseIndex: 0,
        currentCharIndex: 0,
        isDeleting: false
    });

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const type = () => {
            const { currentPhraseIndex, currentCharIndex, isDeleting } = stateRef.current;
            const currentPhrase = phrases[currentPhraseIndex];

            if (isDeleting) {
                setPlaceholderText(`Search for ${currentPhrase.substring(0, currentCharIndex - 1)}`);
                stateRef.current.currentCharIndex--;
            } else {
                setPlaceholderText(`Search for ${currentPhrase.substring(0, currentCharIndex + 1)}`);
                stateRef.current.currentCharIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && stateRef.current.currentCharIndex === currentPhrase.length) {
                stateRef.current.isDeleting = true;
                typeSpeed = 2000; // Pause at end
            } else if (isDeleting && stateRef.current.currentCharIndex === 0) {
                stateRef.current.isDeleting = false;
                stateRef.current.currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                typeSpeed = 500; // Pause before next word
            }

            timeoutId = setTimeout(type, typeSpeed);
        };

        timeoutId = setTimeout(type, 1000);

        return () => clearTimeout(timeoutId);
    }, []);

    // Load recent searches
    useEffect(() => {
        setRecentSearches(getRecentSearches());
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                fetchSuggestions(query);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (searchQuery: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                // Handle both paginated and non-paginated responses
                const products = Array.isArray(data) ? data : data.products || [];
                setResults(products.slice(0, 6).map((p: any) => ({
                    id: p._id || p.id,
                    name: p.name,
                    image: p.image,
                    price: p.price,
                    category: p.category
                })));
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm: string) => {
        if (searchTerm.trim()) {
            addRecentSearch(searchTerm.trim());
            navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
            setIsOpen(false);
            setQuery('');
        }
    };

    const handleProductClick = (productId: string) => {
        navigate(`/product/${productId}`);
        setIsOpen(false);
        setQuery('');
    };

    const handleClearRecent = () => {
        clearRecentSearches();
        setRecentSearches([]);
    };

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholderText}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(query);
                        } else if (e.key === 'Escape') {
                            setIsOpen(false);
                        }
                    }}
                    className="input-search"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    {loading && (
                        <div className="p-4 text-center text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        </div>
                    )}

                    {/* Search Results */}
                    {!loading && results.length > 0 && (
                        <div className="p-2">
                            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">Products</p>
                            {results.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleProductClick(product.id)}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-10 h-10 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">{product.category}</p>
                                    </div>
                                    <span className="font-bold text-primary">₹{product.price}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => handleSearch(query)}
                                className="w-full text-center text-sm text-primary font-medium py-2 hover:bg-primary/5 rounded-lg mt-1"
                            >
                                View all results for "{query}"
                            </button>
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && query.length >= 2 && results.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No products found for "{query}"</p>
                        </div>
                    )}

                    {/* Recent Searches & Suggestions (when no query) */}
                    {!loading && query.length < 2 && (
                        <div className="p-2">
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <>
                                    <div className="flex items-center justify-between px-3 py-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Recent
                                        </span>
                                        <button
                                            onClick={handleClearRecent}
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    {recentSearches.map((search, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSearch(search)}
                                            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                                        >
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{search}</span>
                                        </button>
                                    ))}
                                </>
                            )}

                            {/* Popular Searches */}
                            <div className="px-3 py-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> Popular
                                </span>
                            </div>
                            {['Silk Saree', 'Banarasi', 'Cotton Saree', 'Wedding Collection'].map((term) => (
                                <button
                                    key={term}
                                    onClick={() => handleSearch(term)}
                                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                                >
                                    <TrendingUp className="h-4 w-4 text-primary/50" />
                                    <span>{term}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchAutocomplete;
