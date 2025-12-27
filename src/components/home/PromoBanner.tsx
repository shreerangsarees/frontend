import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Percent, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PromoBanner: React.FC = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="container-app">
        <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 sm:pb-0 sm:grid sm:grid-cols-3 snap-x snap-mandatory hide-scrollbar">
          {/* First promo */}
          <div className="min-w-[85vw] sm:min-w-0 snap-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-6 sm:p-8 text-primary-foreground">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-primary-foreground/20 rounded-full px-3 py-1 text-sm font-medium mb-4">
                <Percent className="h-4 w-4" />
                Limited Time Offer
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold mb-2">
                Get 20% OFF
              </h3>
              <p className="text-primary-foreground/80 mb-4 max-w-xs">
                On your first order! Use code SAREE20.
              </p>
              <Link to="/products">
                <Button variant="secondary" className="group">
                  Shop Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 h-32 w-32 bg-primary-foreground/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -right-8 h-40 w-40 bg-primary-foreground/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 right-8 transform -translate-y-1/2 text-8xl opacity-20">
              👗
            </div>
          </div>

          {/* Second promo */}
          <div className="min-w-[85vw] sm:min-w-0 snap-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary to-secondary/80 p-6 sm:p-8 text-secondary-foreground">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-secondary-foreground/20 rounded-full px-3 py-1 text-sm font-medium mb-4">
                <Gift className="h-4 w-4" />
                Free Shipping
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold mb-2">
                Free Shipping
              </h3>
              <p className="text-secondary-foreground/80 mb-4 max-w-xs">
                On orders above ₹1999. No code needed!
              </p>
              <Link to="/products">
                <Button className="bg-primary-foreground text-secondary hover:bg-primary-foreground/90 group">
                  Explore Collection
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 h-32 w-32 bg-secondary-foreground/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -right-8 h-40 w-40 bg-secondary-foreground/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 right-8 transform -translate-y-1/2 text-8xl opacity-20">
              📦
            </div>
          </div>

          {/* Third promo */}
          <div className="min-w-[85vw] sm:min-w-0 snap-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary to-secondary/60 p-6 sm:p-8 text-foreground">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-background/20 rounded-full px-3 py-1 text-sm font-medium mb-4">
                <Percent className="h-4 w-4" />
                Festive Special
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold mb-2">
                Wedding Collection
              </h3>
              <p className="text-foreground/80 mb-4 max-w-xs">
                Exclusive bridal sarees for your special day.
              </p>
              <Link to="/products">
                <Button variant="default" className="group">
                  View Collection
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 h-32 w-32 bg-background/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -right-8 h-40 w-40 bg-background/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 right-8 transform -translate-y-1/2 text-8xl opacity-20">
              ✨
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
