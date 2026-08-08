import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Truck, Package, Clock, Loader2, Plus, ArrowRight, XCircle, CheckCircle, Smartphone, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminOrders, getStoreConfig, updateStoreConfig } from '@/lib/database.functions';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/dashboard')({
  ssr: false,
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Force poll orders count to check for new ones
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    let lastOrderCount = -1;

    const checkNewOrders = async () => {
       const { data } = await supabase.from('orders').select('id', { count: 'exact', head: true });
       const currentCount = data?.length || 0;
       if (lastOrderCount !== -1 && currentCount > lastOrderCount) {
         audio.play().catch(() => {});
         toast.info('🔔 NOVO PEDIDO RECEBIDO!', { duration: 10000 });
       }
       lastOrderCount = currentCount;
    };

    const interval = setInterval(checkNewOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const queryClient = useQueryClient();
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => getAdminOrders(),
    refetchInterval: 10000,
  });

  const [period, setPeriod] = useState('Hoje');

  const { data: config = {}, isLoading: configLoading } = useQuery({
    queryKey: ['store-config'],
    queryFn: () => getStoreConfig(),
  });

  const updateConfigMutation = useMutation({
    mutationFn: updateStoreConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-config'] });
      toast.success('Status da loja atualizado!');
    }
  });

  if (ordersLoading || configLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-[#E87524]" size={48} />
        </div>
      </AdminLayout>
    );
  }

  const isStoreOpen = config['is_store_open'] === true || config['is_store_open'] === 'true';

  const allOrders = orders as any[];
  
  // Filtering by period
  const getPeriodDate = (p: string) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (p === 'Hoje') return d;
    if (p === 'Ontem') {
      d.setDate(d.getDate() - 1);
      return d;
    }
    if (p === 'Últimos 7 dias') {
      d.setDate(d.getDate() - 7);
      return d;
    }
    if (p === 'Últimos 30 dias') {
      d.setDate(d.getDate() - 30);
      return d;
    }
    if (p === 'Este mês') {
      d.setDate(1);
      return d;
    }
    return d;
  };

  const filterOrdersByPeriod = (orderList: any[]) => {
    const startDate = getPeriodDate(period);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return orderList.filter((o: any) => {
      const orderDate = new Date(o.created_at);
      if (period === 'Ontem') {
        const yesterdayEnd = new Date(startDate);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return orderDate >= startDate && orderDate <= yesterdayEnd;
      }
      return orderDate >= startDate && orderDate <= today;
    });
  };

  const periodOrders = filterOrdersByPeriod(allOrders);
  const completedPeriodOrders = periodOrders.filter((o: any) => o.status === 'completed');
  
  const revenue = completedPeriodOrders.reduce((acc: number, o: any) => acc + Number(o.total), 0);
  const totalOrdersCount = periodOrders.length;
  const avgTicket = completedPeriodOrders.length > 0 ? revenue / completedPeriodOrders.length : 0;
  const inProgress = allOrders.filter((o: any) => ['new', 'accepted', 'preparing', 'ready', 'delivered'].includes(o.status)).length;
  const cancelledCount = periodOrders.filter((o: any) => o.status === 'cancelled').length;

  // Chart data (7 days fixed for visual context, but using calculated values)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(dateStr => {
    const dayOrders = allOrders.filter((o: any) => o.created_at?.startsWith(dateStr) && o.status === 'completed');
    const dayRevenue = dayOrders.reduce((acc: number, o: any) => acc + Number(o.total), 0);
    const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' });
    return { name: dayName, revenue: dayRevenue, date: dateStr };
  });

  // Recent Orders (last 5 total)
  const recentOrders = allOrders.slice(0, 5);

  // Top Products calculation based on period
  const productSales: Record<string, { count: number, revenue: number }> = {};
  periodOrders.forEach((order: any) => {
    if (!order.order_items || order.status === 'cancelled') return;
    order.order_items.forEach((item: any) => {
      if (!productSales[item.name]) {
        productSales[item.name] = { count: 0, revenue: 0 };
      }
      const salesData = productSales[item.name]!;
      salesData.count += item.quantity;
      salesData.revenue += Number(item.total_price);
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Payment Methods based on period
  const paymentsPeriod = periodOrders.filter(o => o.status !== 'cancelled').reduce((acc: Record<string, number>, o: any) => {
    const method = o.payment_method?.toUpperCase() || 'OUTRO';
    acc[method] = (acc[method] || 0) + Number(o.total);
    return acc;
  }, {});

  // Delivery vs Pickup based on period
  const deliveryCount = periodOrders.filter(o => o.delivery_type === 'delivery' && o.status !== 'cancelled').length;
  const pickupCount = periodOrders.filter(o => o.delivery_type === 'pickup' && o.status !== 'cancelled').length;
  const deliveryFees = periodOrders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + Number(o.delivery_fee || 0), 0);

  const toggleStore = () => {
    updateConfigMutation.mutate({ data: { key: 'is_store_open', value: !isStoreOpen } });
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-10">
        {/* Header with Store Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710] uppercase tracking-tighter">Dashboard</h1>
            <p className="text-[#4A2618]/60 font-bold uppercase text-xs tracking-[0.2em]">Controle central da operação</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest",
              isStoreOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              <div className={cn("w-2 h-2 rounded-full animate-pulse", isStoreOpen ? "bg-green-600" : "bg-red-600")} />
              {isStoreOpen ? 'LOJA ABERTA' : 'LOJA FECHADA'}
            </div>
            <Button 
              onClick={toggleStore}
              variant="outline" 
              className={cn(
                "font-black uppercase text-xs h-10 px-6 rounded-xl border-2",
                isStoreOpen ? "border-red-600 text-red-600 hover:bg-red-50" : "border-green-600 text-green-600 hover:bg-green-50"
              )}
            >
              {isStoreOpen ? 'FECHAR LOJA' : 'ABRIR LOJA'}
            </Button>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-[#F3E2CC] self-start overflow-x-auto max-w-full no-scrollbar">
          {['Hoje', 'Ontem', 'Últimos 7 dias', 'Últimos 30 dias', 'Este mês'].map(f => (
            <button 
              key={f} 
              onClick={() => setPeriod(f)}
              className={cn(
                "px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest whitespace-nowrap",
                period === f ? "bg-[#2B1710] text-white" : "text-[#4A2618]/60 hover:bg-[#FFF4E6]"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard title={`FATURAMENTO ${period.toUpperCase()}`} value={formatCurrency(revenue)} icon={DollarSign} color="bg-green-600" />
          <StatsCard title={`PEDIDOS ${period.toUpperCase()}`} value={totalOrdersCount.toString()} icon={ShoppingCart} color="bg-[#E87524]" />
          <StatsCard title="EM ANDAMENTO" value={inProgress.toString()} icon={Clock} color="bg-blue-600" />
          <StatsCard title="TICKET MÉDIO" value={formatCurrency(avgTicket || 0)} icon={TrendingUp} color="bg-purple-600" />
          <StatsCard title={`CANCELADOS ${period.toUpperCase()}`} value={cancelledCount.toString()} icon={XCircle} color="bg-red-600" />
        </div>

        {/* Shortcut Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/produtos">
            <Button className="w-full h-16 bg-[#2B1710] hover:bg-[#4A2618] rounded-2xl gap-3 font-black text-xs uppercase tracking-widest">
              <Plus size={18} className="text-[#E87524]" />
              NOVO PRODUTO
            </Button>
          </Link>
          <Link to="/admin/produtos">
            <Button variant="outline" className="w-full h-16 border-2 border-[#2B1710] text-[#2B1710] hover:bg-[#2B1710] hover:text-white rounded-2xl gap-3 font-black text-xs uppercase tracking-widest transition-all">
              PRODUTOS
            </Button>
          </Link>
          <Link to="/admin/acrescimos">
            <Button variant="outline" className="w-full h-16 border-2 border-[#2B1710] text-[#2B1710] hover:bg-[#2B1710] hover:text-white rounded-2xl gap-3 font-black text-xs uppercase tracking-widest transition-all">
              ACRÉSCIMOS
            </Button>
          </Link>
          <Link to="/admin/categorias">
            <Button variant="outline" className="w-full h-16 border-2 border-[#2B1710] text-[#2B1710] hover:bg-[#2B1710] hover:text-white rounded-2xl gap-3 font-black text-xs uppercase tracking-widest transition-all">
              CATEGORIAS
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden rounded-3xl">
            <CardHeader className="pb-8">
              <CardTitle className="text-lg font-black text-[#2B1710] uppercase tracking-tight">Faturamento Diário (7 dias)</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] w-full pr-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E2CC" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4A2618', fontWeight: 'bold', fontSize: 11 } as any}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4A2618', fontWeight: 'bold', fontSize: 11 } as any}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#FFF4E6' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.date === new Date().toISOString().split('T')[0] ? '#E87524' : '#2B1710'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <div className="p-6 pt-0">
               <Link to="/admin/financeiro">
                 <Button variant="ghost" className="w-full text-[#E87524] font-black uppercase text-xs tracking-widest gap-2 hover:bg-[#FFF4E6]">
                    VER FATURAMENTO COMPLETO
                    <ArrowRight size={16} />
                 </Button>
               </Link>
            </div>
          </Card>

          {/* Status Breakdown */}
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
             <CardHeader>
               <CardTitle className="text-lg font-black text-[#2B1710] uppercase tracking-tight">Status da Operação</CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
                {[
                  { id: 'new', label: 'NOVOS', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { id: 'accepted', label: 'ACEITOS', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                  { id: 'preparing', label: 'EM PREPARO', color: 'text-orange-600', bg: 'bg-orange-50' },
                  { id: 'ready', label: 'PRONTOS', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                  { id: 'delivered', label: 'SAIU P/ ENTREGA', color: 'text-purple-600', bg: 'bg-purple-50' },
                  { id: 'completed', label: 'CONCLUÍDOS', color: 'text-green-600', bg: 'bg-green-50' },
                  { id: 'cancelled', label: 'CANCELADOS', color: 'text-red-600', bg: 'bg-red-50' },
                ].map(status => (
                  <Link 
                    key={status.id} 
                    to="/admin/pedidos" 
                    search={() => ({ status: status.id as any })}
                    className={cn("flex justify-between items-center p-4 rounded-2xl transition-all hover:scale-[1.02] border border-transparent hover:border-[#F3E2CC]", status.bg)}
                  >
                    <span className={cn("font-black text-xs tracking-widest", status.color)}>{status.label}</span>
                    <span className={cn("text-xl font-black", status.color)}>{allOrders.filter(o => o.status === status.id).length}</span>
                  </Link>
                ))}
             </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders List */}
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="text-lg font-black text-[#2B1710] uppercase tracking-tight">Pedidos Recentes</CardTitle>
               <Link to="/admin/pedidos">
                 <Button variant="ghost" size="sm" className="text-[#E87524] font-black uppercase text-[10px] tracking-widest gap-1">
                   VER TODOS
                   <ChevronRight size={14} />
                 </Button>
               </Link>
            </CardHeader>
            <CardContent className="px-0">
               {recentOrders.length === 0 ? (
                 <div className="p-10 text-center text-[#4A2618]/20 font-bold uppercase text-sm">Nenhum pedido ainda</div>
               ) : (
                 <div className="divide-y divide-[#F3E2CC]/50">
                    {recentOrders.map((order: any) => (
                      <Link 
                        key={order.id} 
                        to="/admin/pedidos"
                        search={() => ({ orderId: order.id })}
                        className="flex items-center justify-between p-4 px-6 hover:bg-[#FFF4E6] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                           <div className="bg-[#2B1710] text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs italic">
                              #{order.id.slice(0, 4).toUpperCase()}
                           </div>
                           <div>
                              <p className="font-black text-[#2B1710] uppercase text-sm">{order.customer_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 {order.delivery_type === 'delivery' ? <Truck size={12} className="text-[#E87524]" /> : <Smartphone size={12} className="text-[#E87524]" />}
                                 <p className="text-[10px] font-bold text-[#4A2618]/40 uppercase tracking-widest">
                                    {order.delivery_type === 'delivery' ? 'Entrega' : 'Retirada'}
                                 </p>
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="font-black text-[#2B1710]">{formatCurrency(order.total)}</p>
                           <div className={cn(
                             "inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mt-1",
                             order.status === 'completed' ? 'bg-green-100 text-green-700' :
                             order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                             'bg-orange-100 text-orange-700'
                           )}>
                              {order.status}
                           </div>
                        </div>
                      </Link>
                    ))}
                 </div>
               )}
            </CardContent>
          </Card>

          <div className="space-y-8">
            {/* Top Products */}
            <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-black text-[#2B1710] uppercase tracking-tight">Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {topProducts.map((p, i) => (
                   <div key={p.name} className="flex items-center justify-between p-4 bg-[#FFF4E6] rounded-2xl">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-[#E87524]">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                         </div>
                         <div>
                            <p className="font-black text-[#2B1710] text-xs uppercase">{p.name}</p>
                            <p className="text-[10px] font-bold text-[#4A2618]/40 uppercase">{p.count} vendas</p>
                         </div>
                      </div>
                      <p className="font-black text-[#E87524]">{formatCurrency(p.revenue)}</p>
                   </div>
                 ))}
              </CardContent>
            </Card>

            {/* Financial Breakdown */}
            <Card className="border-none shadow-sm bg-[#2B1710] text-white overflow-hidden rounded-3xl">
               <CardHeader>
                  <CardTitle className="text-lg font-black uppercase tracking-tight text-[#E87524]">Financeiro {period.toUpperCase()}</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                     {['PIX', 'CARD', 'CASH'].map((method) => (
                       <div key={method} className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                          <p className="text-[9px] font-bold text-[#F3E2CC]/40 uppercase tracking-widest mb-1">{method === 'CASH' ? 'Dinheiro' : method === 'CARD' ? 'Cartão' : 'PIX'}</p>
                          <p className="font-black text-sm">{formatCurrency(paymentsPeriod[method] || 0)}</p>
                       </div>
                     ))}
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-3">
                     <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#F3E2CC]/60 uppercase tracking-widest">ENTREGAS ({deliveryCount})</span>
                        <span className="font-black text-green-400">+{formatCurrency(deliveryFees)} taxas</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#F3E2CC]/60 uppercase tracking-widest">RETIRADAS ({pickupCount})</span>
                        <span className="font-black">{pickupCount} pedidos</span>
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

function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden group relative rounded-3xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-[#4A2618]/50 uppercase tracking-[0.2em] mb-1">{title}</p>
            <p className="text-2xl font-black text-[#2B1710]">{value}</p>
          </div>
          <div className={cn("p-4 rounded-2xl text-white shadow-lg relative z-10", color)}>
            <Icon size={24} />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFF4E6]/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500" />
      </CardContent>
    </Card>
  );
}
