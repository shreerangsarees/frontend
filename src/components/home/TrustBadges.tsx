import React from 'react';
import { Truck, Shield, Clock, CreditCard } from 'lucide-react';

const badges = [
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Delivery in 3-5 business days',
  },
  {
    icon: Shield,
    title: 'Premium Quality',
    description: 'Authentic handcrafted sarees',
  },
  {
    icon: Clock,
    title: 'Easy Returns',
    description: '7 days hassle-free returns',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Multiple payment options',
  },
];

const TrustBadges: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 border-t border-border">
      <div className="container-app">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <badge.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">
                {badge.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
