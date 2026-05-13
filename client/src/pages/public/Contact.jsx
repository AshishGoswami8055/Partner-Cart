import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Field } from '@/components/ui/Input';
import { pushToast } from '@/store/slices/toastSlice';

export const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const dispatch = useDispatch();

  const submit = (e) => {
    e.preventDefault();
    dispatch(
      pushToast({
        title: 'Message sent',
        description: 'Our team will reach out within 24 hours.',
        tone: 'success',
      })
    );
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container py-16 max-w-5xl">
      <h1 className="font-display text-4xl font-bold">Talk to us</h1>
      <p className="mt-3 text-muted-foreground">
        Whether you're a customer, vendor, or just curious — we'd love to hear from you.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground">hello@partnercart.io</div>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">Phone</div>
                <div className="text-sm text-muted-foreground">+91 80000 12345</div>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">HQ</div>
                <div className="text-sm text-muted-foreground">
                  WeWork BKC, Mumbai, Maharashtra, India
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-3 p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Your name">
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                />
              </Field>
              <Field label="Email">
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                />
              </Field>
            </div>
            <Field label="Message">
              <Textarea
                rows={6}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us how we can help..."
              />
            </Field>
            <Button type="submit" rightIcon={<Send className="h-4 w-4" />}>Send message</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
