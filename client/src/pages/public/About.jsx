import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const Eyebrow = ({ children, num }) => (
  <div className="flex items-center gap-3">
    {num && <span className="font-mono text-[11px] text-foreground/40">{num}</span>}
    <span className="eyebrow">{children}</span>
  </div>
);

const tenets = [
  {
    t: 'A vendor is not a row in a database.',
    d: 'Every store on PartnerCart is human-reviewed, has a public profile, sets its own terms, and is reachable by chat before you ever buy.',
  },
  {
    t: 'Software should not be a tax on small business.',
    d: 'Our commission rates are published per tier, our payouts run fortnightly, and our dashboards are the same ones our team uses to run the platform.',
  },
  {
    t: 'Local does not mean low-fidelity.',
    d: 'PartnerCart runs on the same multi-tenant order, payments, and real-time architecture you would expect from a platform serving millions of SKUs.',
  },
];

export const AboutPage = () => (
  <div>
    <section className="border-b border-border">
      <div className="container py-20 md:py-28">
        <Eyebrow num="01">About</Eyebrow>
        <h1 className="display-serif mt-5 max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight md:text-6xl">
          We started with a simple frustration: the people who feed our cities
          weren&apos;t online, and the platforms that were online weren&apos;t theirs.
        </h1>
        <p className="mt-8 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
          PartnerCart is an independent multi-vendor marketplace. We don&apos;t take
          inventory, we don&apos;t relabel anyone&apos;s goods, and we don&apos;t pretend to
          curate. We build infrastructure &mdash; the kind global commerce platforms
          run on &mdash; and point it at the kind of small, accountable retailers we
          all want to keep.
        </p>
      </div>
    </section>

    <section className="container py-20 md:py-28">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Eyebrow num="02">What we believe</Eyebrow>
        </div>
        <div className="md:col-span-8">
          <ol className="space-y-8">
            {tenets.map((row, i) => (
              <li key={row.t} className="border-t border-border pt-5">
                <div className="font-mono text-[11px] text-foreground/40">
                  0{i + 1}
                </div>
                <h3 className="mt-2 display-serif text-2xl font-medium tracking-tight">
                  {row.t}
                </h3>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                  {row.d}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>

    <section className="border-y border-border bg-card">
      <div className="container py-20 md:py-28">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow num="03">How it&apos;s built</Eyebrow>
            <h2 className="display-serif mt-3 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Boring infrastructure. Confident craft.
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              The marketplace runs on a Node.js + Express service backed by
              MongoDB, with JWT auth and refresh-token rotation. Real-time
              chat, order updates and notifications stream over a Socket.io
              gateway. The storefront is a React SPA with a hand-built design
              system, Redux Toolkit for cross-cutting state, and TanStack
              Query for the server cache. Payments are Razorpay-ready, media
              flows through Cloudinary. None of this is interesting &mdash; that&apos;s
              the point.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-1 text-sm font-medium link"
            >
              Want the longer version? Get in touch
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>

    <section className="container py-20 md:py-28">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <Eyebrow num="04">Two ways to start</Eyebrow>
          <h2 className="display-serif mt-3 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            Whether you sell or you shop, we&apos;d like you on the platform.
          </h2>
        </div>
        <div className="md:col-span-4 md:text-right">
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/marketplace"><Button size="lg">Browse marketplace</Button></Link>
            <Link to="/auth/signup?role=vendor"><Button size="lg" variant="outline">Apply to sell</Button></Link>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;
