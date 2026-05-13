import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  Store,
  ShieldCheck,
  Truck,
  Headphones,
  Check,
  Leaf,
  UserPlus,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { productApi, vendorApi, categoryApi } from '@/api/endpoints';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/hooks/useCart';

// ---------------------------------------------------------------------------
// Section primitives
// ---------------------------------------------------------------------------

const Eyebrow = ({ children, num }) => (
  <div className="flex items-center gap-3">
    {num && <span className="font-mono text-[11px] text-foreground/40">{num}</span>}
    <span className="eyebrow">{children}</span>
  </div>
);

// ---------------------------------------------------------------------------
// Hero — matches reference screenshot:
//   Left:  eyebrow → big serif headline → description → CTAs → cities
//   Right: one large monochrome image with caption overlay,
//          plus two smaller info cards underneath
// ---------------------------------------------------------------------------

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=80';

const Hero = () => (
  <section>
    <div className="container grid grid-cols-1 gap-12 py-16 md:grid-cols-12 md:gap-16 md:py-24">
      <div className="md:col-span-6">
        <Eyebrow num="01">Marketplace</Eyebrow>
        <h1 className="display-serif mt-5 text-5xl font-medium leading-[0.98] tracking-tight text-balance md:text-[72px] md:leading-[0.96]">
          Local commerce,<br />
          <em className="font-normal">done seriously.</em>
        </h1>
        <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-muted-foreground">
          PartnerCart is an independent marketplace where verified neighborhood
          vendors meet customers who care where things come from. We don&apos;t
          curate for you. We just help you find the people doing it well.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/marketplace">
            <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Browse the marketplace
            </Button>
          </Link>
          <Link to="/auth/signup?role=vendor" className="link text-sm font-medium">
            Sell on PartnerCart <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-14 max-w-md">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Trusted by independent shops in
          </div>
          <p className="mt-3 display-serif text-lg leading-snug">
            Mumbai, Bengaluru, Jaipur, Pune, Hyderabad, and a few other cities
            we&apos;re quietly bringing online.
          </p>
        </div>
      </div>

      <div className="md:col-span-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative col-span-2 aspect-[16/11] overflow-hidden rounded-xl bg-muted ring-1 ring-border">
            <img
              src={HERO_IMAGE}
              alt="An independent vendor in their shop"
              className="h-full w-full object-cover [filter:grayscale(1)_contrast(1.05)]"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-foreground/90 p-4 text-background backdrop-blur-sm md:left-6 md:right-auto md:max-w-[60%]">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-background/40">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <div>
                  <div className="font-medium">Verified vendors</div>
                  <p className="mt-1 text-[12.5px] leading-snug text-background/75">
                    Every shop is verified. Every order supports real people.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <article className="rounded-xl border border-border bg-card p-5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h3 className="mt-4 font-medium">Secure &amp; reliable</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              Safe payments. On-time deliveries. No compromises.
            </p>
          </article>

          <article className="rounded-xl border border-border bg-card p-5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background">
              <Leaf className="h-4 w-4" />
            </span>
            <h3 className="mt-4 font-medium">Local impact</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              Stronger communities. Sustainable choices.
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>
);

// ---------------------------------------------------------------------------
// Trust strip — 4 columns under the hero
// ---------------------------------------------------------------------------

const TRUST = [
  { icon: Store, t: 'Independent shops', d: 'Verified local vendors' },
  { icon: ShieldCheck, t: 'Secure payments', d: '100% protected transactions' },
  { icon: Truck, t: 'Reliable delivery', d: 'Tracking on every order' },
  { icon: Headphones, t: 'Human support', d: 'We are here to help' },
];

const TrustStrip = () => (
  <section className="border-y border-border bg-background">
    <div className="container grid grid-cols-2 gap-y-6 py-8 md:grid-cols-4">
      {TRUST.map((row) => (
        <div key={row.t} className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border text-foreground">
            <row.icon className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[14px] font-medium">{row.t}</div>
            <div className="text-[12.5px] text-muted-foreground">{row.d}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);


// ---------------------------------------------------------------------------
// End-to-end flow: apply → approve → catalogue → shop
// ---------------------------------------------------------------------------

const FLOW_STEPS = [
  {
    Icon: UserPlus,
    title: 'Vendor registers',
    body: 'Creates an account and applies with business details and address.',
    to: '/auth/signup?role=vendor',
    cta: 'Start application',
  },
  {
    Icon: ShieldCheck,
    title: 'Admin reviews',
    body: 'PartnerCart staff approves the store—you get a verified vendor dashboard.',
    to: '/contact',
    cta: 'Questions?',
  },
  {
    Icon: Package,
    title: 'Seller lists products',
    body: 'Vendors publish price, photos and stock—listings sync to Marketplace.',
    to: '/auth/login',
    cta: 'Seller login',
  },
  {
    Icon: ShoppingBag,
    title: 'Customers shop & checkout',
    body: 'Shoppers browse all vendors, cart items from multiple stores, and checkout once.',
    to: '/marketplace',
    cta: 'Browse products',
  },
];

const MarketplaceFlow = () => (
  <section className="border-t border-border bg-muted/25">
    <div className="container py-16 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Multivendor e-commerce</span>
        <h2 className="display-serif mt-3 text-2xl font-medium tracking-tight md:text-4xl">
          From vendor onboarding to unified checkout
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
          Every product in the storefront comes from a verified seller. After approval, vendors manage their own catalogue;
          PartnerCart merges carts into multi-vendor orders so customers checkout like one mall—all online.
        </p>
      </div>
      <ol className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {FLOW_STEPS.map((step, i) => (
          <li key={step.title}>
            <div className="flex h-full flex-col rounded-xl border border-border bg-background p-5 transition hover:border-primary/40 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <step.Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">Step {String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-4 font-display text-[15px] font-semibold">{step.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              <Link to={step.to} className="mt-4 text-sm font-medium text-primary hover:underline">
                {step.cta} →
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

const FeaturedStores = ({ vendors = [] }) => {
  if (!vendors.length) return null;
  return (
    <section className="border-t border-border">
      <div className="container py-16 md:py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="eyebrow">Verified sellers</span>
            <h2 className="display-serif mt-3 text-2xl font-medium md:text-3xl">
              Shop by store
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Each storefront is run by its owner. Open a shop to browse its listings—everything is also searchable on Marketplace.
            </p>
          </div>
          <Link to="/marketplace" className="text-sm font-medium text-primary hover:underline">
            Browse all listings →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vendors.slice(0, 8).map((v) => (
            <Link
              key={v._id}
              to={`/vendors/${v.slug}`}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-foreground text-background transition-colors group-hover:bg-primary">
                  <Store className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="truncate font-display font-semibold">{v.storeName}</div>
                  <div className="truncate text-xs text-muted-foreground">{v.address?.city || 'India'}</div>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{v.tagline || 'Local seller on PartnerCart'}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const Categories = ({ categories = [] }) => (
  <section className="container py-20 md:py-24">
    <div className="text-center">
      <span className="eyebrow">Popular categories</span>
      <h2 className="display-serif mt-3 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
        Discover from local shops across categories
      </h2>
    </div>
    <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {(categories.length ? categories.slice(0, 12) : Array.from({ length: 6 })).map(
        (c, i) =>
          c ? (
            <Link
              key={c._id}
              to={`/marketplace?category=${c._id}`}
              className="group flex aspect-square flex-col items-center justify-center rounded-xl border border-border bg-card p-4 text-center transition hover:border-foreground hover:shadow-sm"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-foreground/5 text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                <Store className="h-4 w-4" />
              </span>
              <div className="mt-3 text-[14px] font-medium">{c.name}</div>
            </Link>
          ) : (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          )
      )}
    </div>
  </section>
);


// ---------------------------------------------------------------------------
// Trending products
// ---------------------------------------------------------------------------

const Trending = ({ products = [] }) => {
  const { addItem } = useCart();
  return (
    <section className="border-t border-border">
      <div className="container py-20 md:py-24">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Eyebrow num="02">Currently moving</Eyebrow>
            <h2 className="display-serif mt-3 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              What people are buying this week.
            </h2>
          </div>
          <Link
            to="/marketplace?sort=salesCount&order=desc"
            className="link text-sm font-medium"
          >
            Browse all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(products.length ? products.slice(0, 4) : Array.from({ length: 4 })).map(
            (p, i) =>
              p ? (
                <article key={p._id} className="group flex flex-col">
                  <Link
                    to={`/products/${p.slug}`}
                    className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted ring-1 ring-border"
                  >
                    {p.images?.[0]?.url && (
                      <img
                        src={p.images[0].url}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]">
                      №{String(i + 1).padStart(2, '0')}
                    </span>
                  </Link>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {p.vendor?.storeName}
                    </span>
                    <span className="font-mono text-[11px] text-foreground">
                      {formatCurrency(p.price)}
                    </span>
                  </div>
                  <Link
                    to={`/products/${p.slug}`}
                    className="mt-2 display-serif text-lg leading-snug tracking-tight text-foreground hover:underline"
                  >
                    {p.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => addItem(p._id)}
                    className="mt-3 self-start text-sm font-medium link"
                  >
                    Add to cart
                  </button>
                </article>
              ) : (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/5] rounded-lg" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              )
          )}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// Inverted pull-quote
// ---------------------------------------------------------------------------

const PullQuote = () => (
  <section className="bg-foreground text-background">
    <div className="container py-20 md:py-28">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
        <div className="md:col-span-2">
          <span className="display-serif text-7xl leading-none italic text-background/40">
            &ldquo;
          </span>
        </div>
        <div className="md:col-span-9">
          <p className="display-serif text-2xl font-normal leading-snug tracking-tight text-balance md:text-3xl">
            We&apos;ve sold from a 12-square-meter shop in Bandra for thirty-two
            years. PartnerCart was the first online platform that made our store
            feel like ours, not like a row in someone else&apos;s catalog.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-background/30" />
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/70">
              Riya P. · Saffron Crafts · Jaipur
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ---------------------------------------------------------------------------
// Final CTA
// ---------------------------------------------------------------------------

const FinalCTA = () => (
  <section className="container py-20 md:py-28">
    <div className="rounded-xl border border-border bg-card p-10 md:p-16">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <Eyebrow num="04">Open invitation</Eyebrow>
          <h3 className="display-serif mt-3 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            If you run a small shop and you&apos;ve been waiting for software
            that takes you seriously, you can stop waiting.
          </h3>
        </div>
        <div className="md:col-span-4 md:text-right">
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/auth/signup?role=vendor">
              <Button size="lg">Apply to sell</Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">Talk to us</Button>
            </Link>
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Reviewed within 48 hours
          </p>
        </div>
      </div>
    </div>
  </section>
);

// ---------------------------------------------------------------------------

export const LandingPage = () => {
  const trending = useQuery({
    queryKey: ['products', 'landing-trending'],
    queryFn: () => productApi.list({ sort: 'salesCount', order: 'desc', limit: 6 }),
  });
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list(),
  });
  const vendorsLanding = useQuery({
    queryKey: ['vendors', 'landing'],
    queryFn: () => vendorApi.list({ limit: 8 }),
  });

  return (
    <div>
      <Hero />
      <TrustStrip />
      <MarketplaceFlow />
      <FeaturedStores vendors={vendorsLanding.data?.data || []} />
      <Categories categories={categories.data || []} />
      <Trending products={trending.data?.data || []} />
      <PullQuote />
      <FinalCTA />
    </div>
  );
};

export default LandingPage;
