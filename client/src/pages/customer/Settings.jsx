import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Separator } from '@/components/ui/Separator';
import { AccountSecurity } from '@/components/shared/AccountSecurity';
import { useTheme } from '@/hooks/useTheme';

export const SettingsPage = () => {
  const { mode, toggle } = useTheme();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a theme that&apos;s easy on your eyes.
        </p>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Dark mode</div>
            <div className="text-sm text-muted-foreground">Currently {mode}</div>
          </div>
          <Switch checked={mode === 'dark'} onChange={toggle} />
        </div>
      </Card>

      <AccountSecurity />
    </div>
  );
};

export default SettingsPage;
