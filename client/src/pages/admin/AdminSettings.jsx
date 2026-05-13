import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Field, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { AccountSecurity } from '@/components/shared/AccountSecurity';

export const AdminSettings = () => (
  <div className="space-y-6 max-w-3xl">
    <h1 className="font-display text-2xl font-bold">Platform settings</h1>

    <AccountSecurity />

    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold">Marketplace</h2>
      <Separator className="my-4" />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Enable new vendor signups</div>
            <div className="text-sm text-muted-foreground">Open or close the vendor application form</div>
          </div>
          <Switch checked onChange={() => {}} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Auto-approve products</div>
            <div className="text-sm text-muted-foreground">Skip moderation for verified vendors</div>
          </div>
          <Switch onChange={() => {}} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Maintenance mode</div>
            <div className="text-sm text-muted-foreground">Temporarily disable the storefront</div>
          </div>
          <Switch onChange={() => {}} />
        </div>
      </div>
    </Card>
    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold">Default commissions</h2>
      <Separator className="my-4" />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Basic vendors %"><Input defaultValue={12} type="number" /></Field>
        <Field label="Premium vendors %"><Input defaultValue={8} type="number" /></Field>
        <Field label="Verified vendors %"><Input defaultValue={6} type="number" /></Field>
      </div>
      <div className="mt-4">
        <Button>Save settings</Button>
      </div>
    </Card>
  </div>
);

export default AdminSettings;
