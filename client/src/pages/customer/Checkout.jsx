import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input, Field, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { useCart } from '@/hooks/useCart';
import { orderApi } from '@/api/endpoints';
import { formatCurrency } from '@/lib/format';
import { pushToast } from '@/store/slices/toastSlice';
import { cn } from '@/lib/cn';

function loadRazorpayCheckoutScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.dataset.razorpayCheckout = '1';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load Razorpay'));
    document.body.appendChild(s);
  });
}

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { cart, itemCount, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [notes, setNotes] = useState('');

  /** Set true when Razorpay calls the success handler — do not delete draft on modal close. */
  const razorpayHandlerInvokedRef = useRef(false);

  const groups = new Set((cart?.items || []).map((i) => String(i.vendor?._id || i.vendor)));
  const shipping = groups.size * 39;
  const total = subtotal + shipping;

  const codSubmit = async () => {
    const order = await orderApi.place({
      shippingAddress: address,
      paymentMethod: 'cod',
      notes,
    });
    await clear();
    dispatch(pushToast({ title: 'Order placed', description: order.orderNumber, tone: 'success' }));
    navigate(`/app/orders/${order._id}`);
  };

  const razorpaySubmit = async () => {
    await loadRazorpayCheckoutScript();
    const session = await orderApi.prepareRazorpay({
      shippingAddress: address,
      notes,
    });

    const Rz = window.Razorpay;
    if (!Rz) {
      throw new Error('Razorpay is unavailable in this browser');
    }

    const partnerId = session.partnerOrderId;

    razorpayHandlerInvokedRef.current = false;

    const rp = new Rz({
      key: session.keyId,
      amount: session.amount,
      currency: session.currency || 'INR',
      order_id: session.razorpayOrderId,
      name: 'PartnerCart',
      description: session.description || 'Marketplace checkout',
      prefill: {
        name: address.fullName || user?.name || '',
        email: user?.email || '',
        contact: address.phone.replace(/\s/g, '') || '',
      },
      theme: { color: '#0a0a0a' },
      modal: {
        ondismiss: () => {
          setLoading(false);
          void (async () => {
            if (razorpayHandlerInvokedRef.current) return;
            try {
              await orderApi.abandonRazorpayCheckout(partnerId);
            } catch {
              /* order may already be gone */
            }
          })();
        },
      },
      handler: (response) => {
        razorpayHandlerInvokedRef.current = true;
        void (async () => {
          try {
            const order = await orderApi.verifyRazorpay(partnerId, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            await clear();
            dispatch(
              pushToast({ title: 'Payment successful', description: order.orderNumber, tone: 'success' })
            );
            navigate(`/app/orders/${order._id}`);
          } catch (err) {
            dispatch(
              pushToast({
                title: 'Could not confirm payment',
                description: err.response?.data?.message || err.message || 'Contact support if you were charged.',
                tone: 'destructive',
              })
            );
          } finally {
            setLoading(false);
          }
        })();
      },
    });

    rp.open();
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (paymentMethod === 'cod') {
        await codSubmit();
      } else {
        await razorpaySubmit();
      }
    } catch (err) {
      dispatch(
        pushToast({
          title: paymentMethod === 'cod' ? 'Could not place order' : 'Could not start payment',
          description: err.response?.data?.message || err.message || 'Please try again',
          tone: 'destructive',
        })
      );
    } finally {
      if (paymentMethod === 'cod') setLoading(false);
    }
  };

  if (!itemCount) {
    return (
      <Card className="p-10 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <h1 className="font-display text-2xl font-bold">Checkout</h1>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold">Shipping address</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Full name">
              <Input required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
            </Field>
            <Field label="Address line 1" className="md:col-span-2">
              <Input required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
            </Field>
            <Field label="Address line 2" className="md:col-span-2">
              <Input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
            </Field>
            <Field label="City">
              <Input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            </Field>
            <Field label="State">
              <Input required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
            </Field>
            <Field label="Postal code">
              <Input required value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
            </Field>
            <Field label="Country">
              <Input value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold">Payment method</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              { v: 'cod', label: 'Cash on Delivery', icon: Wallet, desc: 'Pay in cash on receipt' },
              { v: 'razorpay', label: 'Razorpay', icon: CreditCard, desc: 'UPI / Cards / Netbanking' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.v}
                onClick={() => setPaymentMethod(opt.v)}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 text-left transition',
                  paymentMethod === opt.v
                    ? 'border-primary bg-primary/5 ring-2 ring-ring/30'
                    : 'border-border hover:bg-muted/50'
                )}
              >
                <opt.icon className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
          {paymentMethod === 'razorpay' && (
            <p className="mt-3 text-xs text-muted-foreground">
              Add <span className="font-mono">RAZORPAY_KEY_ID</span> and{' '}
              <span className="font-mono">RAZORPAY_KEY_SECRET</span> to <span className="font-mono">server/.env</span>, then
              restart the API. Use test keys from the Razorpay Dashboard for development.
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold">Order notes</h2>
          <Textarea
            className="mt-4"
            placeholder="Anything our vendors should know?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Card>
      </div>

      <Card className="h-fit p-6 lg:sticky lg:top-20">
        <h2 className="font-display text-lg font-semibold">Order summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vendors</span>
            <span>{groups.size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatCurrency(shipping)}</span>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-display text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <Button type="submit" className="mt-5 w-full" size="lg" loading={loading}>
          {paymentMethod === 'razorpay' ? 'Pay · ' : 'Place order · '}
          {formatCurrency(total)}
        </Button>
      </Card>
    </form>
  );
};

export default CheckoutPage;
