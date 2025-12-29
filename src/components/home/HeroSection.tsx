import React from 'react';
import { ArrowRight, Clock, Truck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/context/SettingsContext';
import heroImage from '@/assets/hero-shreerang.jpg';

const HeroSection: React.FC = () => {
  const { deliveryFee, storeName } = useSettings();

  const features = [
    { icon: Clock, text: '3-14 Days', label: 'Fast Shipping' },
    { icon: Truck, text: deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`, label: 'Shipping Fee' },
    { icon: ShieldCheck, text: 'Premium', label: 'Quality Assured' },
  ];

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container-app py-10 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="relative z-10 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              New Collection Available
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4 animate-fade-in stagger-1">
              Elegant Sarees
              <span className="block gradient-text">For Every Occasion</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 animate-fade-in stagger-2">
              Discover exquisite sarees from {storeName} - from traditional silk to modern designer wear.
              Celebrate every moment in timeless elegance.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in stagger-3">
              <Link to="/products">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  Explore Collection
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
            <div className="flex flex-row items-center justify-between lg:justify-start gap-2 sm:gap-6 mt-8 sm:mt-10 animate-fade-in stagger-4 w-full sm:w-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left flex-1 sm:flex-none">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-card flex items-center justify-center shadow-sm mb-1 sm:mb-0">
                    <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">{feature.text}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{feature.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative block mt-12 lg:mt-0">
            <div className="relative z-10 animate-float">
              <img
                src={heroImage}
                alt="Beautiful Indian Saree"
                className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
              />
            </div>



            {/* Decorative blobs */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -z-10 bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
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
