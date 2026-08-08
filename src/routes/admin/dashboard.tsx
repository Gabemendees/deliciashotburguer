import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getAdminOrders } from '@/lib/database.functions';
import { formatCurrency } from '@/lib/utils';

export const Route = createFileRoute('/admin/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => getAdminOrders(),
  });

  const today = new Date().toISOString().split('T')[0];
  const ordersToday = orders.filter((o: any) => o.created_at.startsWith(today));
  const revenueToday = ordersToday.reduce((acc: number, o: any) => acc + Number(o.total), 0);
  const avgTicket = ordersToday.length > 0 ? revenueToday / ordersToday.length : 0;
  const inDelivery = orders.filter((o: any) => o.status === 'delivered').length;

  return (

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-[#2B1710]">Dashboard</h1>
          <p className="text-[#4A2618]">Visão geral da operação hoje</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="FATURAMENTO HOJE" 
            value={formatCurrency(revenueToday)} 
            icon={DollarSign} 
            color="bg-green-500" 
          />
          <StatsCard 
            title="PEDIDOS HOJE" 
            value={ordersToday.length.toString()} 
            icon={ShoppingCart} 
            color="bg-[#E87524]" 
          />
          <StatsCard 
            title="TICKET MÉDIO" 
            value={formatCurrency(avgTicket)} 
            icon={TrendingUp} 
            color="bg-blue-500" 
          />
          <StatsCard 
            title="EM ENTREGA" 
            value={inDelivery.toString()} 
            icon={Truck} 
            color="bg-purple-500" 
          />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#2B1710]">VENDAS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-[#F3E2CC] rounded-xl text-muted-foreground">
                Gráfico de Faturamento em breve
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#2B1710]">PRODUTOS MAIS VENDIDOS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <BestSellerItem rank={1} name="X-Bacon" sales={32} />
                <BestSellerItem rank={2} name="Hot Dog Original" sales={27} />
                <BestSellerItem rank={3} name="X-Picanha" sales={19} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#4A2618]/60 uppercase tracking-wider mb-1">{title}</p>
            <p className="text-2xl font-black text-[#2B1710]">{value}</p>
          </div>
          <div className={cn("p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform", color)}>
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BestSellerItem({ rank, name, sales }: any) {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="flex items-center justify-between p-4 bg-[#FFF4E6]/50 rounded-xl">
      <div className="flex items-center gap-3">
        <span className="text-xl">{medals[rank - 1] || rank}</span>
        <span className="font-bold text-[#2B1710]">{name}</span>
      </div>
      <span className="text-[#E87524] font-black">{sales} pedidos</span>
    </div>
  );
}
