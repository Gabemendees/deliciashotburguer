import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Truck, Package, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getAdminOrders } from '@/lib/database.functions';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Route = createFileRoute('/admin/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => getAdminOrders(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-[#E87524]" size={48} />
        </div>
      </AdminLayout>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const completedOrders = (orders as any[]).filter((o: any) => o.status !== 'cancelled');
  const ordersToday = completedOrders.filter((o: any) => o.created_at?.startsWith(today));
  
  const revenueToday = ordersToday.reduce((acc: number, o: any) => acc + Number(o.total), 0);
  const avgTicketToday = ordersToday.length > 0 ? revenueToday / ordersToday.length : 0;
  const inProgress = (orders as any[]).filter((o: any) => ['new', 'preparing', 'ready', 'delivered'].includes(o.status)).length;

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(dateStr => {
    const dayOrders = completedOrders.filter((o: any) => o.created_at?.startsWith(dateStr));
    const dayRevenue = dayOrders.reduce((acc: number, o: any) => acc + Number(o.total), 0);
    const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' });
    return { name: dayName, revenue: dayRevenue, date: dateStr };
  });

  const productSales: Record<string, number> = {};
  (orders as any[]).forEach((order: any) => {
    if (order.status === 'cancelled') return;
    order.order_items?.forEach((item: any) => {
      productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-[#2B1710] uppercase tracking-tighter">Painel de Controle</h1>
          <p className="text-[#4A2618]/60 font-bold uppercase text-xs tracking-[0.2em]">Visão geral da operação em tempo real</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="FATURAMENTO HOJE" 
            value={formatCurrency(revenueToday)} 
            icon={DollarSign} 
            color="bg-green-600" 
            trend="+12%"
          />
          <StatsCard 
            title="PEDIDOS HOJE" 
            value={ordersToday.length.toString()} 
            icon={ShoppingCart} 
            color="bg-[#E87524]" 
          />
          <StatsCard 
            title="EM ANDAMENTO" 
            value={inProgress.toString()} 
            icon={Clock} 
            color="bg-blue-600" 
          />
          <StatsCard 
            title="TICKET MÉDIO" 
            value={formatCurrency(avgTicketToday || 0)} 
            icon={TrendingUp} 
            color="bg-purple-600" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
              <div>
                <CardTitle className="text-lg font-black text-[#2B1710] uppercase tracking-tight">Faturamento (7 dias)</CardTitle>
                <p className="text-xs text-[#4A2618]/60 font-bold uppercase tracking-wider">Desempenho semanal bruto</p>
              </div>
            </CardHeader>
            <CardContent className="h-[350px] w-full pr-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E2CC" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4A2618', fontWeight: 'bold', fontSize: 12 } as any}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4A2618', fontWeight: 'bold', fontSize: 12 } as any}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#FFF4E6' }}
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#2B1710] text-white p-3 rounded-xl shadow-xl border-none">
                            <p className="font-bold text-xs uppercase mb-1">{payload[0].payload?.date || ''}</p>
                            <p className="text-xl font-black">{formatCurrency(Number(payload[0].value || 0))}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.date === today ? '#E87524' : '#2B1710'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-black text-[#2B1710] uppercase tracking-tight">Top Produtos</CardTitle>
                <p className="text-xs text-[#4A2618]/60 font-bold uppercase tracking-wider">Mais vendidos do período</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.map((product, i) => (
                    <BestSellerItem key={product.name} rank={i + 1} name={product.name} sales={product.sales} />
                  ))}
                  {topProducts.length === 0 && (
                    <p className="text-center text-sm text-[#4A2618]/60 py-8">Nenhuma venda registrada.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-[#FFF4E6] border-2 border-dashed border-[#F3E2CC]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl text-[#E87524] shadow-sm">
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#4A2618]/60 uppercase tracking-widest">PEDIDOS RECENTES</p>
                    <p className="text-lg font-black text-[#2B1710]">{(orders as any[]).length} totais</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatsCard({ title, value, icon: Icon, color, trend }: any) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden group relative">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-[#4A2618]/50 uppercase tracking-[0.2em] mb-1">{title}</p>
            <p className="text-2xl font-black text-[#2B1710]">{value}</p>
            {trend && (
              <span className="inline-flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-2">
                <TrendingUp size={10} className="mr-1" />
                {trend}
              </span>
            )}
          </div>
          <div className={cn("p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10", color)}>
            <Icon size={24} />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F3E2CC]/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
      </CardContent>
    </Card>
  );
}

function BestSellerItem({ rank, name, sales }: any) {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="flex items-center justify-between p-4 bg-[#FFF4E6]/50 rounded-2xl group hover:bg-[#F3E2CC] transition-colors border border-transparent hover:border-[#E87524]/20">
      <div className="flex items-center gap-3">
        <span className="text-xl w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-black text-[#E87524] group-hover:scale-110 transition-transform">
          {medals[rank - 1] || rank}
        </span>
        <span className="font-bold text-[#2B1710] uppercase text-sm truncate max-w-[120px] md:max-w-none">{name}</span>
      </div>
      <div className="text-right">
        <span className="text-[#E87524] font-black text-lg block leading-none">{sales}</span>
        <span className="text-[10px] font-bold text-[#4A2618]/40 uppercase tracking-tighter">unidades</span>
      </div>
    </div>
  );
}
