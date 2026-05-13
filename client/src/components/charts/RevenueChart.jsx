import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/format';

export const RevenueChart = ({ data = [], dataKey = 'revenue', color = 'hsl(var(--primary))', height = 240 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="_id" stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
      <YAxis
        stroke="hsl(var(--muted-foreground))"
        fontSize={11}
        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        width={36}
      />
      <Tooltip
        contentStyle={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 12,
          fontSize: 12,
        }}
        formatter={(value) => formatCurrency(value)}
      />
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        strokeWidth={2.5}
        fill="url(#rev-grad)"
      />
    </AreaChart>
  </ResponsiveContainer>
);
