import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    image: string;
    icon?: React.ReactNode;
    itemCount?: number;
    productCount?: number;
  };
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, className }) => {
  const count = category.itemCount ?? category.productCount ?? 0;

  return (
    <Link
      to={`/category/${category.id}`}
      className={cn(
        "group relative flex flex-col items-center p-4 rounded-2xl bg-card border border-border card-hover",
        className
      )}
    >
      {/* Icon/Image */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 rounded-2xl overflow-hidden bg-muted">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
        {category.icon && (
          <span className="absolute inset-0 flex items-center justify-center text-3xl">
            {category.icon}
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="font-medium text-foreground text-center text-sm sm:text-base group-hover:text-primary transition-colors">
        {category.name}
      </h3>

      {/* Product count */}
      <p className="text-xs text-muted-foreground mt-0.5">
        {count} items
      </p>
    </Link>
  );
};

export default CategoryCard;
