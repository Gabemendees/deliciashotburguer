import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Package, Clock, Search, Filter, 
  ChevronRight, Phone, Calendar, DollarSign,
  CheckCircle2, Play, PackageCheck, Truck, XCircle,
  AlertCircle
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminOrders, updateOrderStatus } from '@/lib/database.functions';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute('/admin/pedidos')({
  component: Pedidos,
});

const statusColors: any = {
  new: "bg-blue-500",
  accepted: "bg-cyan-500",
  preparing: "bg-yellow-500",
  ready: "bg-orange-500",
  delivered: "bg-purple-500",
  completed: "bg-green-600",
  cancelled: "bg-red-500"
};

const statusLabels: any = {
  new: "NOVO",
  accepted: "ACEITO",
  preparing: "EM PREPARO",
  ready: "PRONTO",
  delivered: "SAIU PARA ENTREGA",
  completed: "CONCLUÍDO",
  cancelled: "CANCELADO"
};

function Pedidos() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("TODOS");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => getAdminOrders(),
    refetchInterval: 15000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (input: { id: string, status: any }) => updateOrderStatus({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success("Status atualizado com sucesso!");
    },
    onError: () => toast.error("Erro ao atualizar status.")
  });

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "TODOS") return matchesSearch;
    return matchesSearch && statusLabels[order.status] === activeFilter;
  });

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status: status as any });
  };

  const confirmCancel = () => {
    if (selectedOrder) {
      handleUpdateStatus(selectedOrder.id, 'cancelled');
      setCancelDialogOpen(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710] uppercase tracking-tighter">Gerenciamento de Pedidos</h1>
            <p className="text-[#4A2618]/60 font-bold uppercase text-xs tracking-[0.2em]">Acompanhe e controle sua operação</p>
          </div>
          
          <div className="flex gap-2 bg-white p-1 rounded-2xl shadow-sm overflow-x-auto max-w-full no-scrollbar border border-[#F3E2CC]">
            {['TODOS', 'NOVO', 'ACEITO', 'EM PREPARO', 'PRONTO', 'SAIU PARA ENTREGA', 'CONCLUÍDO', 'CANCELADO'].map((f) => (
              <button 
                key={f} 
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest",
                  f === activeFilter 
                    ? "bg-[#E87524] text-white shadow-md shadow-[#E87524]/20" 
                    : "text-[#4A2618]/60 hover:bg-[#FFF4E6] hover:text-[#E87524]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2 border-none shadow-sm bg-white p-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A2618]/30" size={20} />
              <Input 
                placeholder="Pesquisar por nome, telefone ou #ID..." 
                className="pl-12 h-12 bg-[#FFF4E6]/30 border-none focus-visible:ring-[#E87524] font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Card>
          <Card className="border-none shadow-sm bg-[#2B1710] text-white flex items-center justify-center p-2">
            <p className="font-black uppercase text-xs tracking-[0.2em]">Total: {filteredOrders.length} pedidos</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-24 bg-white rounded-3xl">
                <Clock className="animate-spin text-[#E87524]" size={48} />
              </div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((pedido: any) => (
                <PedidoCard 
                  key={pedido.id}
                  pedido={pedido}
                  isActive={selectedOrder?.id === pedido.id}
                  onClick={() => setSelectedOrder(pedido)}
                />
              ))
            ) : (
              <div className="text-center p-24 bg-white rounded-3xl border-2 border-dashed border-[#F3E2CC]">
                <Package className="mx-auto text-[#F3E2CC] mb-4" size={64} />
                <p className="text-[#4A2618]/60 font-black uppercase tracking-widest">Nenhum pedido encontrado</p>
              </div>
            )}
          </div>

          <div className="relative">
            {selectedOrder ? (
              <div className="sticky top-8">
                <OrderDetail 
                  order={selectedOrder} 
                  onUpdateStatus={handleUpdateStatus}
                  onCancel={() => setCancelDialogOpen(true)}
                />
              </div>
            ) : (
              <div className="h-[400px] bg-white/50 border-2 border-dashed border-[#F3E2CC] rounded-3xl flex flex-col items-center justify-center text-center p-8 sticky top-8">
                <AlertCircle className="text-[#F3E2CC] mb-4" size={48} />
                <p className="text-[#4A2618]/40 font-bold uppercase text-xs tracking-widest">Selecione um pedido para ver os detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-white border-none rounded-3xl max-w-sm">
          <DialogHeader className="items-center text-center pb-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} />
            </div>
            <DialogTitle className="text-2xl font-black text-[#2B1710] uppercase tracking-tighter">Cancelar Pedido?</DialogTitle>
            <DialogDescription className="text-[#4A2618]/60 font-medium">
              Tem certeza que deseja cancelar o pedido #{selectedOrder?.id.slice(0, 4)}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button 
              onClick={confirmCancel}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black h-12 rounded-xl"
            >
              SIM, CANCELAR PEDIDO
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setCancelDialogOpen(false)}
              className="w-full text-[#4A2618]/60 font-bold h-12 rounded-xl"
            >
              VOLTAR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function PedidoCard({ pedido, isActive, onClick }: any) {
  const shortId = pedido.order_number;
  const time = new Date(pedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "border-none shadow-sm transition-all cursor-pointer group overflow-hidden relative",
        isActive ? "bg-[#FFF4E6] ring-2 ring-[#E87524]" : "bg-white hover:bg-[#FFF4E6]/50"
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch h-full">
          <div className={cn("w-2", statusColors[pedido.status])} />
          <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF4E6] flex items-center justify-center text-[#E87524] font-black border border-[#F3E2CC] text-xl shadow-inner group-hover:scale-110 transition-transform">
                #{shortId}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-black text-[#2B1710] text-xl uppercase truncate max-w-[200px]">{pedido.customer_name}</h3>
                  <Badge className={cn("px-3 py-1 text-[9px] font-black text-white border-none rounded-lg", statusColors[pedido.status])}>
                    {statusLabels[pedido.status]}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#4A2618]/50 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    {pedido.delivery_type === 'delivery' ? <Truck size={14} className="text-[#E87524]" /> : <Package size={14} className="text-[#E87524]" />}
                    {pedido.delivery_type === 'delivery' ? 'Entrega' : 'Retirada'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#E87524]" />
                    {time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign size={14} className="text-[#E87524]" />
                    {pedido.payment_method.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
              <div className="text-right">
                <p className="text-[10px] font-black text-[#4A2618]/30 uppercase tracking-[0.2em] mb-1">Valor Total</p>
                <p className="text-2xl font-black text-[#2B1710] tracking-tighter">{formatCurrency(Number(pedido.total))}</p>
              </div>
              <ChevronRight className={cn("text-[#F3E2CC] transition-transform", isActive && "rotate-90 text-[#E87524]")} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderDetail({ order, onUpdateStatus, onCancel }: any) {
  const shortId = order.order_number;
  const date = new Date(order.created_at).toLocaleDateString('pt-BR');
  const time = new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
      <CardHeader className="bg-[#2B1710] text-white p-8">
        <div className="flex items-center justify-between mb-4">
          <Badge className={cn("px-4 py-1.5 text-xs font-black text-white border-none rounded-full shadow-lg", statusColors[order.status])}>
            {statusLabels[order.status]}
          </Badge>
          <p className="text-xs font-black uppercase tracking-widest text-white/40">#{order.id}</p>
        </div>
        <CardTitle className="text-4xl font-black uppercase tracking-tighter flex items-baseline gap-2">
          Pedido <span className="text-[#E87524]">#{shortId}</span>
        </CardTitle>
        <div className="flex items-center gap-4 mt-4 text-[#F3E2CC]/60 font-bold text-xs uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {date}</span>
          <span className="flex items-center gap-1.5"><Clock size={14} /> {time}</span>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        {/* Customer Info */}
        <section className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#4A2618]/30 uppercase tracking-[0.2em]">Cliente</p>
            <p className="font-black text-[#2B1710] text-lg uppercase leading-none">{order.customer_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#4A2618]/30 uppercase tracking-[0.2em]">Telefone</p>
            <a href={`tel:${order.customer_phone}`} className="font-black text-[#E87524] text-lg flex items-center gap-2 hover:underline">
              <Phone size={16} /> {order.customer_phone}
            </a>
          </div>
        </section>

        {/* Address Info */}
        <section className="p-6 bg-[#FFF4E6]/50 rounded-2xl border border-[#F3E2CC]">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-[#E87524] text-white rounded-lg">
              {order.delivery_type === 'delivery' ? <Truck size={18} /> : <Package size={18} />}
            </div>
            <h4 className="font-black text-[#2B1710] uppercase tracking-tighter text-lg">
              {order.delivery_type === 'delivery' ? 'Entrega em Domicílio' : 'Retirada no Local'}
            </h4>
          </div>
          
          {order.delivery_type === 'delivery' ? (
            <div className="space-y-3">
              <p className="font-bold text-[#4A2618] leading-tight">
                {order.address_street}, {order.address_number}<br />
                {order.address_neighborhood} • {order.address_city} - {order.address_state}<br />
                CEP: {order.address_zip}
              </p>
              {order.address_reference && (
                <div className="pt-2 border-t border-[#F3E2CC]">
                  <p className="text-[10px] font-black text-[#4A2618]/30 uppercase tracking-widest mb-1">Referência</p>
                  <p className="text-sm font-bold text-[#4A2618] italic">"{order.address_reference}"</p>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 text-xs font-black uppercase tracking-widest text-[#E87524]">
                <span>Taxa de Entrega</span>
                <span>{formatCurrency(Number(order.delivery_fee))}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm font-bold text-[#4A2618]">O cliente virá buscar o pedido no trailer.</p>
          )}
        </section>

        {/* Products */}
        <section className="space-y-4">
          <p className="text-[10px] font-black text-[#4A2618]/30 uppercase tracking-[0.2em] border-b border-[#F3E2CC] pb-2">Produtos do Pedido</p>
          <div className="space-y-6">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#2B1710] text-white flex items-center justify-center font-black shrink-0">
                  {item.quantity}x
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-black text-[#2B1710] uppercase text-base">{item.name}</h5>
                    <span className="font-black text-[#2B1710]">{formatCurrency(Number(item.total_price))}</span>
                  </div>
                  
                  {item.order_item_additions && item.order_item_additions.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[9px] font-black text-[#E87524] uppercase tracking-widest mb-1">Acréscimos:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.order_item_additions.map((add: any) => (
                          <span key={add.id} className="text-[10px] font-bold text-[#4A2618]/60 bg-[#FFF4E6] px-2 py-0.5 rounded-full border border-[#F3E2CC]">
                            + {add.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.observation && (
                    <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                      <p className="text-[9px] font-black text-yellow-600 uppercase tracking-widest mb-1">Observação:</p>
                      <p className="text-xs font-bold text-yellow-800 italic leading-snug">"{item.observation}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Totals */}
        <section className="pt-6 border-t-2 border-dashed border-[#F3E2CC] space-y-2">
          <div className="flex justify-between text-sm font-bold text-[#4A2618]/60 uppercase tracking-widest">
            <span>Subtotal</span>
            <span>{formatCurrency(Number(order.subtotal))}</span>
          </div>
          {order.delivery_type === 'delivery' && (
            <div className="flex justify-between text-sm font-bold text-[#4A2618]/60 uppercase tracking-widest">
              <span>Taxa de Entrega</span>
              <span>{formatCurrency(Number(order.delivery_fee))}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-black text-[#2B1710] uppercase tracking-tighter">Total</span>
            <span className="text-3xl font-black text-[#E87524] tracking-tighter">{formatCurrency(Number(order.total))}</span>
          </div>
          <div className="flex items-center justify-between pt-4">
             <span className="text-[10px] font-black text-[#4A2618]/30 uppercase tracking-[0.2em]">Forma de Pagamento</span>
             <Badge variant="outline" className="font-black uppercase tracking-widest border-[#F3E2CC] text-[#2B1710] bg-[#FFF4E6]">
               {order.payment_method}
             </Badge>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-3 pt-6">
          <p className="text-[10px] font-black text-[#4A2618]/30 uppercase tracking-[0.2em] mb-4">Ações do Pedido</p>
          
          <div className="grid grid-cols-1 gap-2">
            {order.status === 'new' && (
              <Button 
                onClick={() => onUpdateStatus(order.id, 'accepted')}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-black h-14 rounded-2xl gap-3 shadow-lg shadow-cyan-600/20"
              >
                <CheckCircle2 size={20} /> ACEITAR PEDIDO
              </Button>
            )}

            {order.status === 'accepted' && (
              <Button 
                onClick={() => onUpdateStatus(order.id, 'preparing')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl gap-3 shadow-lg shadow-blue-600/20"
              >
                <Play size={20} /> INICIAR PREPARO
              </Button>
            )}
            
            {order.status === 'preparing' && (
              <Button 
                onClick={() => onUpdateStatus(order.id, 'ready')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-black h-14 rounded-2xl gap-3 shadow-lg shadow-yellow-500/20"
              >
                <PackageCheck size={20} /> PRONTO PARA ENVIO
              </Button>
            )}
            
            {order.status === 'ready' && order.delivery_type === 'delivery' && (
              <Button 
                onClick={() => onUpdateStatus(order.id, 'delivered')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black h-14 rounded-2xl gap-3 shadow-lg shadow-purple-600/20"
              >
                <Truck size={20} /> SAIU PARA ENTREGA
              </Button>
            )}
            
            {(order.status === 'ready' && order.delivery_type === 'pickup') || order.status === 'delivered' && (
              <Button 
                onClick={() => onUpdateStatus(order.id, 'completed')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black h-14 rounded-2xl gap-3 shadow-lg shadow-green-600/20"
              >
                <CheckCircle2 size={20} /> FINALIZAR PEDIDO
              </Button>
            )}

            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <Button 
                variant="ghost"
                onClick={onCancel}
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 font-black h-12 rounded-2xl gap-3"
              >
                <XCircle size={18} /> CANCELAR PEDIDO
              </Button>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
