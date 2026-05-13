import { Check, Circle, Truck, Package, Sparkles, ShieldCheck, MapPin } from 'lucide-react';
import { ORDER_STATUS_FLOW, STATUS_LABEL } from '@/lib/constants';
import { cn } from '@/lib/cn';

const ICONS = {
  pending: Sparkles,
  confirmed: ShieldCheck,
  preparing: Package,
  shipped: Truck,
  out_for_delivery: MapPin,
  delivered: Check,
};

export const OrderTimeline = ({ status, history = [] }) => {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);
  return (
    <div className="flex w-full flex-col gap-3">
      {ORDER_STATUS_FLOW.map((s, i) => {
        const reached = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = ICONS[s] || Circle;
        const event = history.find((h) => h.status === s);
        return (
          <div key={s} className="flex items-start gap-3">
            <div
              className={cn(
                'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors',
                reached
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground',
                isCurrent && 'animate-pulse-soft'
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  'text-sm font-medium',
                  reached ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {STATUS_LABEL[s]}
              </span>
              {event ? (
                <span className="text-xs text-muted-foreground">
                  {new Date(event.at).toLocaleString()}
                  {event.note ? ` · ${event.note}` : ''}
                </span>
              ) : (
                isCurrent && <span className="text-xs text-muted-foreground">In progress</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
