import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/dashboard')({
  component: Dashboard,
});

function Dashboard() {
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
            value="R$ 1.250,00" 
            icon={DollarSign} 
            color="bg-green-500" 
          />
          <StatsCard 
            title="PEDIDOS HOJE" 
            value="32" 
            icon={ShoppingCart} 
            color="bg-[#E87524]" 
          />
          <StatsCard 
            title="TICKET MÉDIO" 
            value="R$ 39,06" 
            icon={TrendingUp} 
            color="bg-blue-500" 
          />
          <StatsCard 
            title="EM ENTREGA" 
            value="4" 
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
