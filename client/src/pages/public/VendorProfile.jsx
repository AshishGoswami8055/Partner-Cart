import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Store, ShieldCheck, MapPin, Star } from 'lucide-react';
import { vendorApi, productApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/shared/ProductCard';
import { useCart } from '@/hooks/useCart';

export const VendorProfilePage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();

  const { data: vendor } = useQuery({
    queryKey: ['vendor', slug],
    queryFn: () => vendorApi.bySlug(slug),
  });
  const { data: products } = useQuery({
    queryKey: ['vendor-products', vendor?._id],
    queryFn: () => productApi.list({ vendor: vendor._id, limit: 24 }),
    enabled: !!vendor?._id,
  });

  if (!vendor) return null;

  return (
    <div>
      <div
        className="relative h-56 w-full overflow-hidden border-b border-border bg-muted"
        style={
          vendor.banner?.url
            ? { background: `url(${vendor.banner.url}) center/cover` }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>
      <div className="container -mt-16">
        <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
          <div className="grid h-20 w-20 place-items-center rounded-md bg-foreground text-background">
            <Store className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{vendor.storeName}</h1>
              <Badge tone="success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </Badge>
              <Badge tone="primary">{vendor.tier}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{vendor.tagline}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {vendor.address?.city || 'India'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-warning" />
                {vendor.rating?.average?.toFixed(1) || '—'} ({vendor.rating?.count || 0} ratings)
              </span>
              <span>{vendor.stats?.totalProducts || 0} products</span>
            </div>
          </div>
          <Button>Follow store</Button>
        </Card>

        {vendor.description && (
          <Card className="mt-6 p-6 leading-relaxed text-muted-foreground">
            {vendor.description}
          </Card>
        )}

        <h2 className="mt-10 mb-4 font-display text-2xl font-bold">Products</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(products?.data || []).map((p) => (
            <ProductCard key={p._id} product={p} onAdd={(prod) => addItem(prod._id)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;
