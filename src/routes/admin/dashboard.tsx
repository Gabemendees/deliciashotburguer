import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Truck, Package, Clock, Loader2, Plus, ArrowRight, XCircle, CheckCircle, Smartphone } from 'lucide-react';
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
  const allOrders = orders as any[];
  const completedOrders = allOrders.filter((o: any) => o.status !== 'cancelled');
  const ordersToday = completedOrders.filter((o: any) => o.created_at?.startsWith(today));
  
  const revenueToday = ordersToday.reduce((acc: number, o: any) => acc + Number(o.total), 0);
  const avgTicketToday = ordersToday.length > 0 ? revenueToday / ordersToday.length : 0;
  const inProgress = allOrders.filter((o: any) => ['new', 'preparing', 'ready', 'delivered'].includes(o.status)).length;
  const cancelledToday = allOrders.filter((o: any) => o.status === 'cancelled' && o.created_at?.startsWith(today)).length;

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

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-[#2B1710] uppercase tracking-tighter">Painel de Controle</h1>
          <p className="text-[#4A2618]/60 font-bold uppercase text-xs tracking-[0.2em]">Visão geral da operação em tempo real</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard title="FATURAMENTO HOJE" value={formatCurrency(revenueToday)} icon={DollarSign} color="bg-green-600" />
          <StatsCard title="PEDIDOS HOJE" value={ordersToday.length.toString()} icon={ShoppingCart} color="bg-[#E87524]" />
          <StatsCard title="EM ANDAMENTO" value={inProgress.toString()} icon={Clock} color="bg-blue-600" />
          <StatsCard title="TICKET MÉDIO" value={formatCurrency(avgTicketToday || 0)} icon={TrendingUp} color="bg-purple-600" />
          <StatsCard title="CANCELADOS HOJE" value={cancelledToday.toString()} icon={XCircle} color="bg-red-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-8">
              <CardTitle className="text-lg font-black text-[#2B1710] uppercase tracking-tight">Faturamento (7 dias)</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] w-full pr-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E2CC" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4A2618', fontWeight: 'bold', fontSize: 12 } as any} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4A2618', fontWeight: 'bold', fontSize: 12 } as any} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip cursor={{ fill: '#FFF4E6' }} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.date === today ? '#E87524' : '#2B1710'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
             <CardHeader>
               <CardTitle className="text-lg font-black text-[#2B1710] uppercase tracking-tight">Status dos Pedidos</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                {['new', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'].map(status => (
                  <div key={status} className="flex justify-between items-center p-3 bg-[#FFF4E6] rounded-lg">
                    <span className="font-bold uppercase text-xs text-[#4A2618]">{status}</span>
                    <span className="font-black text-[#E87524]">{allOrders.filter(o => o.status === status).length}</span>
                  </div>
                ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden group relative">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-[#4A2618]/50 uppercase tracking-[0.2em] mb-1">{title}</p>
            <p className="text-2xl font-black text-[#2B1710]">{value}</p>
          </div>
          <div className={cn("p-4 rounded-2xl text-white", color)}>
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
