import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productApi, categoryApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCard } from '@/components/shared/ProductCard';
import { useCart } from '@/hooks/useCart';

const sortOptions = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'salesCount:desc', label: 'Best sellers' },
  { value: 'price:asc', label: 'Price: low to high' },
  { value: 'price:desc', label: 'Price: high to low' },
  { value: 'rating:desc', label: 'Top rated' },
];

export const MarketplacePage = () => {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState({
    q: params.get('q') || '',
    category: params.get('category') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    rating: params.get('rating') || '',
    inStock: params.get('inStock') === 'true',
    city: params.get('city') || '',
    sort: params.get('sort') || 'createdAt',
    order: params.get('order') || 'desc',
    page: Number(params.get('page')) || 1,
  });

  useEffect(() => {
    const next = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== false && v !== null && v !== undefined) next.set(k, String(v));
    });
    setParams(next, { replace: true });
  }, [filters, setParams]);

  const { addItem } = useCart();

  const queryParams = useMemo(() => {
    const out = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v === '' || v === false || v === null) return;
      out[k] = v;
    });
    out.limit = 24;
    return out;
  }, [filters]);

  const products = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productApi.list(queryParams),
    keepPreviousData: true,
  });

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list(),
  });

  const setFilter = (k, v) => setFilters((s) => ({ ...s, [k]: v, page: 1 }));
  const clearFilters = () =>
    setFilters({
      q: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStock: false,
      city: '',
      sort: 'createdAt',
      order: 'desc',
      page: 1,
    });

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.data?.meta?.total ?? '—'} products from verified vendors only. Add to cart from multiple stores and checkout once—orders are split per seller behind the scenes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
            placeholder="Search products..."
            leftIcon={<Search className="h-4 w-4" />}
            className="md:w-72"
          />
          <Select
            value={`${filters.sort}:${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split(':');
              setFilters((s) => ({ ...s, sort, order, page: 1 }));
            }}
            className="md:w-52"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside>
          <Card className="sticky top-20 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="font-display font-semibold">Filters</span>
              </div>
              <Button variant="link" size="sm" onClick={clearFilters} leftIcon={<X className="h-3.5 w-3.5" />}>
                Reset
              </Button>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Category
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    tone={!filters.category ? 'primary' : 'muted'}
                    className="cursor-pointer"
                    onClick={() => setFilter('category', '')}
                  >
                    All
                  </Badge>
                  {(categories.data || []).map((c) => (
                    <Badge
                      key={c._id}
                      tone={filters.category === c._id ? 'primary' : 'muted'}
                      className="cursor-pointer"
                      onClick={() => setFilter('category', c._id)}
                    >
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Price
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilter('minPrice', e.target.value)}
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilter('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Rating
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[4, 3, 2].map((r) => (
                    <Badge
                      key={r}
                      tone={Number(filters.rating) === r ? 'primary' : 'muted'}
                      className="cursor-pointer"
                      onClick={() => setFilter('rating', filters.rating == r ? '' : r)}
                    >
                      {r}+ stars
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Location
                </div>
                <Input
                  placeholder="City..."
                  value={filters.city}
                  onChange={(e) => setFilter('city', e.target.value)}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={filters.inStock}
                  onChange={(e) => setFilter('inStock', e.target.checked)}
                />
                In stock only
              </label>
            </div>
          </Card>
        </aside>

        <section>
          {products.isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : !products.data?.data?.length ? (
            <EmptyState
              icon={Search}
              title="No products match your filters"
              description="Try clearing filters or searching different keywords."
              action={
                <Button onClick={clearFilters} variant="outline">
                  Reset filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.data.data.map((p) => (
                  <ProductCard key={p._id} product={p} onAdd={(prod) => addItem(prod._id)} />
                ))}
              </div>

              {products.data.meta && products.data.meta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() => setFilter('page', Math.max(1, filters.page - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {filters.page} of {products.data.meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= products.data.meta.totalPages}
                    onClick={() => setFilter('page', filters.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default MarketplacePage;
