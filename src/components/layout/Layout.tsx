import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import FestivalThemeManager from '../theme/FestivalThemeManager';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <FestivalThemeManager />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default Layout;
