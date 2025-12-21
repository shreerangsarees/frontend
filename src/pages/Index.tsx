import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
// import FeaturedProducts from '@/components/home/FeaturedProducts'; // Replaced by Generic Carousel
import ProductCarousel from '@/components/home/ProductCarousel';
import CouponBanner from '@/components/home/CouponBanner';
import TrustBadges from '@/components/home/TrustBadges';
import { Sparkles, TrendingUp, Star, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <HeroSection />
      <CouponBanner />
      <CategoriesSection />

      {/* Smart Sections */}
      {user && (
        <ProductCarousel
          title="Recommended for You"
          description="Based on your recent interests"
          apiUrl="/api/products/recommendations"
          icon={ThumbsUp}
        />
      )}

      <ProductCarousel
        title="Best Sellers"
        description="Most loved by our customers"
        apiUrl="/api/products/trending"
        icon={TrendingUp}
      />

      <ProductCarousel
        title="Top Rated"
        description="Highest quality selections"
        apiUrl="/api/products/top-rated"
        icon={Star}
      />

      <ProductCarousel
        title="Featured Deals"
        description="Handpicked offers"
        apiUrl="/api/products/featured"
        icon={Sparkles}
        linkUrl="/offers"
      />

      <TrustBadges />
    </Layout>
  );
};

export default Index;
