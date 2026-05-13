import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Heart, Minus, Plus, Store, Truck, ShieldCheck, MessagesSquare } from 'lucide-react';
import { productApi, reviewApi, messageApi } from '@/api/endpoints';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { RatingStars } from '@/components/shared/RatingStars';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { formatCurrency, formatRelative } from '@/lib/format';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch } from 'react-redux';
import { pushToast } from '@/store/slices/toastSlice';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.bySlug(slug),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', product?._id],
    queryFn: () => reviewApi.list(product._id),
    enabled: !!product?._id,
  });

  const startChat = useMutation({
    mutationFn: () =>
      messageApi.start({ vendorId: product.vendor._id, body: `Hi, I'm interested in "${product.title}".` }),
    onSuccess: () => dispatch(pushToast({ title: 'Conversation started', tone: 'success' })),
  });

  if (isLoading) {
    return (
      <div className="container py-10 grid gap-10 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <div className="container py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {product.images?.[activeImg]?.url ? (
              <img
                src={product.images[activeImg].url}
                alt={product.title}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="aspect-square grid place-items-center text-muted-foreground">No image</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-thin">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === activeImg ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Link
            to={`/vendors/${product.vendor.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <Store className="h-3.5 w-3.5" /> {product.vendor.storeName}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight">{product.title}</h1>
          <div className="mt-3 flex items-center gap-3">
            <RatingStars value={product.rating?.average || 0} showNumber />
            <span className="text-sm text-muted-foreground">·  {product.rating?.count || 0} reviews</span>
            <Badge tone={product.stock > 0 ? 'success' : 'destructive'} dot>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Badge>
          </div>

          <div className="mt-5 flex items-end gap-4">
            <span className="font-display text-3xl font-bold">{formatCurrency(product.price)}</span>
            {product.compareAtPrice > product.price && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
                <Badge tone="destructive">-{discount}%</Badge>
              </>
            )}
          </div>

          <p className="mt-5 text-muted-foreground">{product.shortDescription || product.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-lg border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center hover:bg-muted">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="grid h-10 w-10 place-items-center hover:bg-muted">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" onClick={() => addItem(product._id, qty)} disabled={product.stock <= 0}>
              Add to cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              leftIcon={<MessagesSquare className="h-4 w-4" />}
              disabled={!isAuthenticated}
              onClick={() => startChat.mutate()}
            >
              Chat with vendor
            </Button>
            <Button size="lg" variant="ghost" leftIcon={<Heart className="h-4 w-4" />}>
              Wishlist
            </Button>
          </div>

          <div className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4" /> Standard delivery in 3–5 days
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> 7-day easy returns &amp; PartnerCart Guarantee
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.rating?.count || 0})</TabsTrigger>
            <TabsTrigger value="vendor">Vendor</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <Card className="p-6 leading-relaxed text-muted-foreground whitespace-pre-line">
              {product.description}
            </Card>
          </TabsContent>
          <TabsContent value="reviews">
            <div className="space-y-3">
              {(reviews?.data || []).length === 0 && (
                <Card className="p-6 text-center text-muted-foreground">No reviews yet.</Card>
              )}
              {(reviews?.data || []).map((r) => (
                <Card key={r._id} className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.user?.name || 'Customer'}</div>
                    <span className="text-xs text-muted-foreground">{formatRelative(r.createdAt)}</span>
                  </div>
                  <div className="mt-1">
                    <RatingStars value={r.rating} />
                  </div>
                  {r.title && <div className="mt-2 font-medium">{r.title}</div>}
                  {r.body && <p className="mt-1 text-muted-foreground">{r.body}</p>}
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="vendor">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-md bg-foreground text-background">
                  <Store className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="font-display text-lg font-semibold">{product.vendor.storeName}</div>
                  <div className="text-sm text-muted-foreground">
                    {product.vendor.address?.city || 'India'} · Tier: {product.vendor.tier}
                  </div>
                </div>
                <Link to={`/vendors/${product.vendor.slug}`}>
                  <Button variant="outline">Visit store</Button>
                </Link>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetailPage;
