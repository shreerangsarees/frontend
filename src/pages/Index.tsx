import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
// import FeaturedProducts from '@/components/home/FeaturedProducts'; // Replaced by Generic Carousel
import ProductCarousel from '@/components/home/ProductCarousel';
import CouponBanner from '@/components/home/CouponBanner';
import TrustBadges from '@/components/home/TrustBadges';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import BannerSlideshow from '@/components/home/BannerSlideshow';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import { Sparkles, TrendingUp, Star, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/apiConfig';
import { useAuth } from '@/context/AuthContext';
import { FadeIn } from '@/components/ui/motion';
import { LiveBadge } from '@/components/home/LiveVisuals'; // removed messy visuals

import ShopByOccasion from '@/components/home/ShopByOccasion';
import SpotlightCollection from '@/components/home/SpotlightCollection';
import Newsletter from '@/components/home/Newsletter';

import YouTubeSection from '@/components/home/YouTubeSection';
import InstagramSection from '@/components/home/InstagramSection';
import BlogSection from '@/components/home/BlogSection';
import HomeSkeleton from '@/components/home/HomeSkeleton';

const Index: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initial page load for skeleton
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <HomeSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen pb-20">
        {/* Dynamic Banners from Admin */}
        <FadeIn direction="down" delay={100}>
          <div className="container-app py-4">
            <BannerSlideshow />
          </div>
        </FadeIn>

        {/* Static Hero Section (Backup) */}
        <FadeIn delay={200}>
          <HeroSection />
        </FadeIn>

        <FadeIn direction="right" delay={300}>
          <div className="container-app py-4">
            <CouponBanner />
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <CategoriesSection />
        </FadeIn>

        {/* NEW: Shop By Occasion */}
        <FadeIn delay={500}>
          <ShopByOccasion />
        </FadeIn>

        {/* Recently Viewed */}
        <FadeIn delay={200}>
          <div className="container-app">
            <RecentlyViewed />
          </div>
        </FadeIn>

        {/* Smart Product Sections */}
        {user && (
          <FadeIn direction="up">
            <ProductCarousel
              title="Recommended for You"
              description="Based on your recent interests"
              apiUrl={`${API_BASE_URL}/products/recommendations`}
              icon={ThumbsUp}
            />
          </FadeIn>
        )}

        <FadeIn direction="up">
          <ProductCarousel
            title="Best Sellers"
            description="Most loved by our customers"
            apiUrl={`${API_BASE_URL}/products/trending`}
            icon={TrendingUp}
          />
        </FadeIn>

        {/* NEW: Spotlight Collection - Break the monotony */}
        <FadeIn delay={300}>
          <SpotlightCollection />
        </FadeIn>

        <FadeIn direction="up">
          <ProductCarousel
            title="Top Rated"
            description="Highest quality selections"
            apiUrl={`${API_BASE_URL}/products/top-rated`}
            icon={Star}
          />
        </FadeIn>

        <FadeIn direction="up">
          <ProductCarousel
            title="Featured Deals"
            description="Handpicked offers"
            apiUrl={`${API_BASE_URL}/products/featured`}
            icon={Sparkles}
            linkUrl="/offers"
          />
        </FadeIn>

        {/* Customer Testimonials */}
        <FadeIn direction="up">
          <TestimonialsSection />
        </FadeIn>

        {/* Social & Content Sections (Moved to Bottom) */}
        <FadeIn delay={600}>
          <BlogSection />
        </FadeIn>

        <FadeIn delay={700}>
          <YouTubeSection />
        </FadeIn>

        <FadeIn delay={800}>
          <InstagramSection />
        </FadeIn>

        {/* NEW: Newsletter */}
        <FadeIn delay={900}>
          <Newsletter />
        </FadeIn>

        <FadeIn direction="up" delay={200}>
          <TrustBadges />
        </FadeIn>
      </div>
    </Layout>
  );
};

export default Index;

