import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const OrdersBarChart = ({ data = [], dataKey = 'orders', color = 'hsl(var(--accent))', height = 240 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
      <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="_id" stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} />
      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} width={28} />
      <Tooltip
        contentStyle={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 12,
          fontSize: 12,
        }}
      />
      <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
