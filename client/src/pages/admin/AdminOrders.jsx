import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListOrdered } from 'lucide-react';

export const AdminOrders = () => (
  <div className="space-y-5">
    <h1 className="font-display text-2xl font-bold">All orders</h1>
    <Card className="p-6">
      <EmptyState
        icon={ListOrdered}
        title="Order moderation"
        description="Use the analytics dashboard for aggregate order signal. Per-order moderation and dispute tools land here in the next iteration."
      />
    </Card>
  </div>
);

export default AdminOrders;
