import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, ToggleLeft as Toggle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/acrescimos')({
  component: Acrescimos,
});

function Acrescimos() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710]">Acréscimos</h1>
            <p className="text-[#4A2618]">Personalização dos lanches</p>
          </div>
          <Button className="bg-[#E87524] hover:bg-[#C95718] text-white font-bold gap-2">
            <Plus size={20} />
            NOVO ACRÉSCIMO
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdditionCard name="Bacon" price={4.00} available={true} />
          <AdditionCard name="Cheddar" price={5.00} available={true} />
          <AdditionCard name="Ovo de codorna" price={1.00} available={true} />
          <AdditionCard name="Catupiry" price={4.00} available={true} />
          <AdditionCard name="Mussarela" price={4.00} available={false} />
        </div>
      </div>
    </AdminLayout>
  );
}

function AdditionCard({ name, price, available }: any) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-[#2B1710] text-xl">{name}</h3>
          <Badge className={cn("px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full", available ? "bg-green-500" : "bg-red-500")}>
            {available ? "ATIVO" : "INATIVO"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-[#E87524]">R$ {price.toFixed(2).replace('.', ',')}</span>
          <div className="flex items-center gap-1">
            <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
            <button className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"><Toggle size={18} /></button>
            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
