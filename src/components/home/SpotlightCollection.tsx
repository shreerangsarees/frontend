import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SpotlightCollection = () => {
    const navigate = useNavigate();
    const [config, setConfig] = React.useState<any>(null);

    React.useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.spotlight) {
                    setConfig(data.spotlight);
                }
            })
            .catch(err => console.error("Failed to load spotlight config", err));
    }, []);

    if (!config || config.active === false) return null;

    return (
        <section className="py-8 md:py-16">
            <div className="container-app">
                <div className="relative rounded-3xl overflow-hidden bg-[#0F172A] min-h-[500px] flex items-center">
                    {/* Background Image with optimized blending */}
                    <div className="absolute inset-0 md:left-[25%]">
                        <img
                            src={config.image || "/assets/spotlight-paithani.png"}
                            alt={config.title}
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Desktop Gradient: Left to Right (Solid -> Transparent) */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/90 to-transparent" />

                        {/* Mobile Gradient: Bottom to Top (Solid -> Transparent) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent md:hidden" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-8 md:p-16 max-w-2xl h-full flex flex-col justify-center">
                        {config.badge && (
                            <div className="inline-block px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm text-yellow-400 text-xs font-semibold tracking-wider uppercase mb-6 w-fit">
                                {config.badge}
                            </div>
                        )}

                        <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
                            {config.title}
                        </h2>

                        <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-lg drop-shadow-md">
                            {config.description}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Button
                                size="lg"
                                onClick={() => navigate(config.categoryId ? `/products?category=${config.categoryId}` : '/products')}
                                className="bg-white text-slate-900 hover:bg-yellow-50 border-none px-8 font-semibold"
                            >
                                Shop Collection <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => navigate('/about-us')}
                                className="border-slate-600 text-white hover:bg-white/10 backdrop-blur-sm"
                            >
                                Read Story
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SpotlightCollection;
