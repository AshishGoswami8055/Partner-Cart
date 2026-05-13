import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Store, Plus, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Separator } from '@/components/ui/Separator';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/format';

export const CartPage = () => {
  const { cart, itemCount, subtotal, updateItem, removeItem, clear } = useCart();
  const navigate = useNavigate();

  const groups = (cart?.items || []).reduce((acc, item) => {
    const key = String(item.vendor?._id || item.vendor);
    if (!acc[key])
      acc[key] = { vendor: item.vendor, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  if (!itemCount) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Discover handpicked products from local vendors."
        action={
          <Link to="/marketplace">
            <Button>Browse marketplace</Button>
          </Link>
        }
      />
    );
  }

  const shipping = Object.keys(groups).length * 39;
  const total = subtotal + shipping;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Your cart</h1>
          <Button variant="ghost" size="sm" onClick={clear} leftIcon={<Trash2 className="h-3.5 w-3.5" />}>
            Clear cart
          </Button>
        </div>

        {Object.values(groups).map((g, idx) => (
          <Card key={idx} className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{g.vendor?.storeName || 'Vendor'}</span>
              <Badge tone="muted" className="ml-auto">
                {g.items.length} item{g.items.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="divide-y divide-border">
              {g.items.map((item) => (
                <div key={item._id} className="flex gap-4 p-5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.product?.images?.[0]?.url || item.imageSnapshot ? (
                      <img
                        src={item.product?.images?.[0]?.url || item.imageSnapshot}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/products/${item.product?.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {item.product?.title || item.titleSnapshot}
                    </Link>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {formatCurrency(item.priceSnapshot)} · {item.product?.stock || '—'} in stock
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-lg border border-border">
                        <button
                          onClick={() =>
                            updateItem(item.product._id || item.product, Math.max(1, item.quantity - 1))
                          }
                          className="grid h-8 w-8 place-items-center hover:bg-muted"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateItem(item.product._id || item.product, item.quantity + 1)
                          }
                          className="grid h-8 w-8 place-items-center hover:bg-muted"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product._id || item.product)}
                        className="text-sm text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(item.priceSnapshot * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="h-fit p-6 lg:sticky lg:top-20">
        <h2 className="font-display text-lg font-semibold">Order summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Shipping · {Object.keys(groups).length} vendor{Object.keys(groups).length > 1 ? 's' : ''}
            </span>
            <span>{formatCurrency(shipping)}</span>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-display text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <Button className="mt-5 w-full" size="lg" onClick={() => navigate('/app/checkout')}>
          Proceed to checkout
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Multi-vendor orders are split automatically and shipped from each vendor.
        </p>
      </Card>
    </div>
  );
};

export default CartPage;
