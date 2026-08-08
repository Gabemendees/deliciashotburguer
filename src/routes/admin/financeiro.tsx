import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { cn, formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminOrders } from '@/lib/database.functions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Banknote, QrCode, TrendingUp, TrendingDown, Loader2, Calendar, DollarSign } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/admin/financeiro')({
  component: Financeiro,
});

function Financeiro() {
  const [filter, setFilter] = useState('30 dias');
  
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => getAdminOrders(),
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

  // Basic filtering logic based on orders
  const completedOrders = (orders as any[]).filter((o: any) => o.status === 'completed');
  
  const totalRevenue = completedOrders.reduce((acc: number, o: any) => acc + Number(o.total), 0);
  const totalOrders = completedOrders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const pixRevenue = completedOrders.filter((o: any) => o.payment_method === 'pix').reduce((acc: number, o: any) => acc + Number(o.total), 0);
  const cardRevenue = completedOrders.filter((o: any) => o.payment_method === 'card').reduce((acc: number, o: any) => acc + Number(o.total), 0);
  const cashRevenue = completedOrders.filter((o: any) => o.payment_method === 'cash').reduce((acc: number, o: any) => acc + Number(o.total), 0);

  const pixPercentage = totalRevenue > 0 ? Math.round((pixRevenue / totalRevenue) * 100) : 0;
  const cardPercentage = totalRevenue > 0 ? Math.round((cardRevenue / totalRevenue) * 100) : 0;
  const cashPercentage = totalRevenue > 0 ? Math.round((cashRevenue / totalRevenue) * 100) : 0;

  // Chart data (simulated based on real orders if needed, but let's stick to the period for now)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const revenue = completedOrders.filter((o: any) => o.created_at?.startsWith(dateStr)).reduce((acc: number, o: any) => acc + Number(o.total), 0);
    return { name: d.toLocaleDateString('pt-BR', { weekday: 'short' }), val: revenue };
  }).reverse();

  const maxVal = Math.max(...last7Days.map(d => d.val), 100);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710] uppercase tracking-tighter">Gestão Financeira</h1>
            <p className="text-[#4A2618]/60 font-bold uppercase text-xs tracking-[0.2em]">Relatório completo de faturamento</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-[#F3E2CC]">
            {['Hoje', '7 dias', '30 dias', 'Este mês'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest",
                  filter === f ? "bg-[#2B1710] text-white" : "text-[#4A2618]/60 hover:bg-[#FFF4E6]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl bg-[#2B1710] text-white overflow-hidden relative group">
            <CardContent className="p-8 relative z-10">
              <p className="text-[#F3E2CC]/40 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Faturamento Bruto</p>
              <h2 className="text-4xl font-black mb-4 tracking-tighter">{formatCurrency(totalRevenue)}</h2>
              <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                <TrendingUp size={18} />
                <span>Cálculo baseado em pedidos concluídos</span>
              </div>
            </CardContent>
            <DollarSign className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden group">
            <CardContent className="p-8">
              <p className="text-[#4A2618]/40 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Ticket Médio</p>
              <h2 className="text-4xl font-black text-[#2B1710] mb-4 tracking-tighter">{formatCurrency(avgTicket)}</h2>
              <div className="flex items-center gap-2 text-[#E87524] font-bold text-sm">
                <Calendar size={18} />
                <span>Média geral do período</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardContent className="p-8">
              <p className="text-[#4A2618]/40 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Total de Pedidos</p>
              <h2 className="text-4xl font-black text-[#2B1710] mb-4 tracking-tighter">{totalOrders}</h2>
              <p className="text-[#E87524] font-bold text-sm uppercase tracking-widest">Apenas pedidos concluídos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-[#FFF4E6] pb-6">
              <CardTitle className="text-lg font-black text-[#2B1710] uppercase tracking-tight">Formas de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <PaymentMethodRow icon={QrCode} name="PIX" amount={formatCurrency(pixRevenue)} percentage={pixPercentage} color="text-teal-500" />
              <PaymentMethodRow icon={CreditCard} name="Cartão" amount={formatCurrency(cardRevenue)} percentage={cardPercentage} color="text-purple-500" />
              <PaymentMethodRow icon={Banknote} name="Dinheiro" amount={formatCurrency(cashRevenue)} percentage={cashPercentage} color="text-green-600" />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-[#FFF4E6] pb-6">
              <CardTitle className="text-lg font-black text-[#2B1710] uppercase tracking-tight">Vendas Diárias (7d)</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[250px] flex items-end justify-between gap-4">
                {last7Days.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="relative w-full h-full flex flex-col justify-end">
                      <div 
                        className="w-full bg-[#E87524] rounded-t-xl transition-all duration-500 group-hover:bg-[#2B1710] relative" 
                        style={{ height: `${(d.val / maxVal) * 100}%` }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2B1710] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                          {formatCurrency(d.val)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[#4A2618]/40 uppercase tracking-tighter">
                      {d.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function PaymentMethodRow({ icon: Icon, name, amount, percentage, color }: any) {
  return (
    <div className="flex items-center justify-between p-5 bg-[#FFF4E6]/50 rounded-2xl group hover:bg-[#F3E2CC] transition-all border border-transparent hover:border-[#E87524]/10">
      <div className="flex items-center gap-4">
        <div className={cn("p-4 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform", color)}>
          <Icon size={20} />
        </div>
        <div>
          <p className="font-black text-[#2B1710] uppercase tracking-tight">{name}</p>
          <p className="text-[10px] font-bold text-[#4A2618]/40 uppercase tracking-widest">{percentage}% do faturamento</p>
        </div>
      </div>
      <span className="text-xl font-black text-[#2B1710] tracking-tighter">{amount}</span>
    </div>
  );
}
