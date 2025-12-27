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
              <img src="/logo.png" alt="Shreerang Saree" className="h-12 w-12 rounded-lg object-cover" />
              <div>
                <h2 className="text-xl font-display font-bold text-background">श्रीरंग</h2>
                <p className="text-xs text-background/60">साडी ही संस्कृती अतूट ऋणानुबंध</p>
              </div>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              Your trusted destination for beautiful sarees, from silk to cotton,
              traditional to designer. Celebrate every occasion in elegance.
            </p>
            <p className="text-xs text-background/50 font-mono">
              GSTIN: 27AJBPR98861ZZ
            </p>
            <div className="flex gap-3">
              <a href="#" className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display font-semibold text-background mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'Products', 'Categories', 'Offers', 'About Us', 'Contact Us'].map((link) => (
                <li key={link}>
                  <Link
                    to={
                      link === 'Home' ? '/' :
                        link === 'Contact Us' ? '/contact' :
                          `/${link.toLowerCase().replace(' ', '-')}`
                    }
                    className="text-sm text-background/70 hover:text-secondary transition-colors"
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
                    className="text-sm text-background/70 hover:text-secondary transition-colors"
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
                <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                <span className="text-background/70">{storeInfo.address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-secondary shrink-0" />
                <span className="text-background/70">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-secondary shrink-0" />
                <span className="text-background/70">support@shreerangsaree.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-secondary shrink-0" />
                <span className="text-background/70">{storeInfo.openingHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container-app py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-background/50">
          <p>© 2024 Shreerang Saree. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-secondary transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
            <Link to="/contact" className="hover:text-secondary transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
