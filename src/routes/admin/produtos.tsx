import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit2, Trash2, Copy, ToggleLeft as Toggle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/admin/produtos')({
  component: Produtos,
});

function Produtos() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710]">Produtos</h1>
            <p className="text-[#4A2618]">Gerencie seu cardápio</p>
          </div>
          <Button className="bg-[#E87524] hover:bg-[#C95718] text-white font-bold gap-2">
            <Plus size={20} />
            NOVO PRODUTO
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2 border-none shadow-sm bg-white p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                placeholder="Buscar produto..." 
                className="pl-10 bg-[#FFF4E6]/50 border-none focus-visible:ring-[#E87524]"
              />
            </div>
          </Card>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['Todos', 'Hambúrgueres', 'Hot Dogs', 'Bebidas'].map(cat => (
              <button key={cat} className="px-4 py-2 bg-white rounded-lg text-sm font-bold whitespace-nowrap shadow-sm hover:bg-[#F3E2CC] transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <ProductRow 
            name="X-BACON" 
            category="Hambúrgueres" 
            price={15.00} 
            available={true}
            image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&auto=format&fit=crop"
          />
          <ProductRow 
            name="HOT DOG ORIGINAL" 
            category="Hot Dogs" 
            price={6.00} 
            available={true}
            image="https://images.unsplash.com/photo-1612392062631-94dd858cba88?q=80&w=200&auto=format&fit=crop"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function ProductRow({ name, category, price, available, image }: any) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden group">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFF4E6] shrink-0 border border-[#F3E2CC]">
              <img src={image} alt={name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-black text-[#2B1710] text-lg uppercase">{name}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-bold border-[#F3E2CC] text-[#4A2618]/60 uppercase tracking-wider">
                  {category}
                </Badge>
                <span className="text-[#E87524] font-black">R$ {price.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto md:ml-0">
            <Badge className={available ? "bg-green-500" : "bg-red-500"}>
              {available ? "Disponível" : "Indisponível"}
            </Badge>
            <div className="flex items-center gap-1 border-l border-[#F3E2CC] pl-4">
              <ActionButton icon={Edit2} color="text-blue-500 hover:bg-blue-50" />
              <ActionButton icon={Copy} color="text-purple-500 hover:bg-purple-50" />
              <ActionButton icon={Toggle} color="text-orange-500 hover:bg-orange-50" />
              <ActionButton icon={Trash2} color="text-red-500 hover:bg-red-50" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionButton({ icon: Icon, color }: any) {
  return (
    <button className={cn("p-2 rounded-lg transition-colors", color)}>
      <Icon size={18} />
    </button>
  );
}
