import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { storeInfo } from '@/lib/store';

const Footer: React.FC = () => {
  return (
    <footer className="bg-foreground text-background/80 mt-auto">
      {/* Main footer */}
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-coral flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">T</span>
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-background">T-Mart</h2>
                <p className="text-xs text-background/60">Fresh & Fast Delivery</p>
              </div>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              Your trusted neighborhood store for fresh groceries, daily essentials, and more.
              Fast delivery right to your doorstep.
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-coral transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-coral transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-coral transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display font-semibold text-background mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'Products', 'Categories', 'Offers', 'About Us'].map((link) => (
                <li key={link}>
                  <Link
                    to={link === 'Home' ? '/' : `/${link.toLowerCase().replace(' ', '-')}`}
                    className="text-sm text-background/70 hover:text-coral transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h3 className="font-display font-semibold text-background mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {['My Orders', 'Track Order', 'FAQs', 'Return Policy', 'Privacy Policy'].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase().replace(' ', '-')}`}
                    className="text-sm text-background/70 hover:text-coral transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="font-display font-semibold text-background mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-coral shrink-0" />
                <span className="text-background/70">{storeInfo.address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-coral shrink-0" />
                <span className="text-background/70">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-coral shrink-0" />
                <span className="text-background/70">support@tmart.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-coral shrink-0" />
                <span className="text-background/70">{storeInfo.openingHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container-app py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-background/50">
          <p>© 2024 T-Mart. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-coral transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-coral transition-colors">Privacy</Link>
            <Link to="/contact" className="hover:text-coral transition-colors">Contact Developers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
