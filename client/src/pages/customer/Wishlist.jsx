import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { wishlistApi } from '@/api/endpoints';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/shared/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCart } from '@/hooks/useCart';

export const WishlistPage = () => {
  const qc = useQueryClient();
  const { addItem } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.get(),
  });

  const remove = useMutation({
    mutationFn: (id) => wishlistApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data?.products?.length) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save your favorites and revisit them anytime."
        action={
          <Link to="/marketplace">
            <Button>Find products</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <h1 className="mb-5 font-display text-2xl font-bold">Your wishlist</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.products.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            isWishlisted
            onWishlist={() => remove.mutate(p._id)}
            onAdd={(prod) => addItem(prod._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
