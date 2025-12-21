import React from 'react';
import { ArrowRight, Clock, Truck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/context/SettingsContext';

const HeroSection: React.FC = () => {
  const { deliveryFee, storeName } = useSettings();

  const features = [
    { icon: Clock, text: '30-45 mins', label: 'Fast Delivery' },
    { icon: Truck, text: `₹${deliveryFee}`, label: 'Delivery Fee' },
    { icon: ShieldCheck, text: 'Fresh', label: 'Quality Guaranteed' },
  ];

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container-app py-10 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="relative z-10 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-coral-light text-coral px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <span className="h-2 w-2 bg-coral rounded-full animate-pulse" />
              Now delivering in your area
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4 animate-fade-in stagger-1">
              Fresh Groceries
              <span className="block gradient-text">Delivered Fast</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 animate-fade-in stagger-2">
              Get the freshest groceries from {storeName} delivered to your doorstep in just 30-45 mins.
              Shop from a wide variety of products.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in stagger-3">
              <Link to="/products">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  Start Shopping
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Browse Categories
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-10 animate-fade-in stagger-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center shadow-sm">
                    <feature.icon className="h-5 w-5 text-coral" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{feature.text}</p>
                    <p className="text-xs text-muted-foreground">{feature.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative hidden lg:block">
            <div className="relative z-10 animate-float">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"
                alt="Fresh groceries"
                className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
              />
            </div>

            {/* Floating cards */}
            <div className="absolute -left-4 top-1/4 z-20 bg-card rounded-2xl shadow-lg p-4 animate-bounce-soft">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-teal-light flex items-center justify-center">
                  <span className="text-2xl">🥬</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Fresh Veggies</p>
                  <p className="text-sm text-muted-foreground">45+ items</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-1/4 z-20 bg-card rounded-2xl shadow-lg p-4 animate-bounce-soft" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-golden-light flex items-center justify-center">
                  <span className="text-2xl">🥛</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Dairy Fresh</p>
                  <p className="text-sm text-muted-foreground">32+ items</p>
                </div>
              </div>
            </div>

            {/* Decorative blobs */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-coral/10 rounded-full blur-3xl" />
            <div className="absolute -z-10 bottom-0 right-0 w-64 h-64 bg-teal/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 50L48 45.8C96 41.7 192 33.3 288 29.2C384 25 480 25 576 33.3C672 41.7 768 58.3 864 62.5C960 66.7 1056 58.3 1152 50C1248 41.7 1344 33.3 1392 29.2L1440 25V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
