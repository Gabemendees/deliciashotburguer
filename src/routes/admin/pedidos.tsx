import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/pedidos')({
  component: Pedidos,
});

const statusColors: any = {
  new: "bg-blue-500",
  preparing: "bg-yellow-500",
  ready: "bg-[#E87524]",
  delivered: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500"
};

const statusLabels: any = {
  new: "NOVO",
  preparing: "EM PREPARO",
  ready: "PRONTO",
  delivered: "SAIU PARA ENTREGA",
  completed: "CONCLUÍDO",
  cancelled: "CANCELADO"
};

function Pedidos() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710]">Pedidos</h1>
            <p className="text-[#4A2618]">Gerencie os pedidos em tempo real</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['Todos', 'Novos', 'Em preparo', 'Pronto', 'Entregando'].map((f) => (
              <button key={f} className={cn(
                "px-4 py-2 rounded-full text-sm font-bold transition-all",
                f === 'Todos' ? "bg-[#E87524] text-white" : "bg-white text-[#4A2618] hover:bg-[#F3E2CC]"
              )}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <PedidoCard 
            id="1024" 
            customer="João Silva" 
            type="delivery" 
            total={42.00} 
            status="new" 
            time="18:45" 
          />
          <PedidoCard 
            id="1023" 
            customer="Maria Oliveira" 
            type="pickup" 
            total={35.50} 
            status="preparing" 
            time="18:30" 
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function PedidoCard({ id, customer, type, total, status, time }: any) {
  return (
    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFF4E6] flex items-center justify-center text-[#E87524] font-black border border-[#F3E2CC]">
              #{id}
            </div>
            <div>
              <p className="font-black text-[#2B1710] text-lg">{customer}</p>
              <div className="flex items-center gap-3 text-sm text-[#4A2618]/60">
                <span className="flex items-center gap-1">
                  {type === 'delivery' ? <MapPin size={14} /> : <Package size={14} />}
                  {type === 'delivery' ? 'Entrega' : 'Retirada'}
                </span>
                <span>•</span>
                <span>Hoje às {time}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
            <div className="text-right">
              <p className="text-xs font-bold text-[#4A2618]/60 uppercase tracking-widest">TOTAL</p>
              <p className="text-xl font-black text-[#2B1710]">R$ {total.toFixed(2).replace('.', ',')}</p>
            </div>
            <Badge className={cn("px-4 py-2 text-white font-bold rounded-lg border-none", statusColors[status])}>
              {statusLabels[status]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
