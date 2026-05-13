import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RatingStars } from './RatingStars';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/cn';

export const ProductCard = ({ product, onAdd, onWishlist, isWishlisted = false, className }) => {
  if (!product) return null;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-elevated',
        className
      )}
    >
      <Link to={`/products/${product.slug}`} className="relative block aspect-square bg-muted">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        {discount > 0 && (
          <Badge tone="destructive" className="absolute left-3 top-3 shadow-soft">
            -{discount}%
          </Badge>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onWishlist?.(product);
          }}
          className={cn(
            'absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 text-foreground shadow-soft backdrop-blur-sm transition',
            isWishlisted && 'text-destructive'
          )}
          aria-label="Wishlist"
        >
          <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Store className="h-3.5 w-3.5" />
          <span className="truncate">{product.vendor?.storeName || 'Marketplace'}</span>
        </div>
        <Link
          to={`/products/${product.slug}`}
          className="mt-1 line-clamp-2 font-display font-semibold leading-snug hover:text-primary"
        >
          {product.title}
        </Link>
        <div className="mt-2">
          <RatingStars value={product.rating?.average || 0} showNumber size={12} />
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="font-display text-lg font-semibold">
              {formatCurrency(product.price)}
            </div>
            {product.compareAtPrice > product.price && (
              <div className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </div>
            )}
          </div>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<ShoppingBag className="h-4 w-4" />}
            onClick={(e) => {
              e.preventDefault();
              onAdd?.(product);
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
