import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';

export const Route = createFileRoute('/admin/categorias')({
  component: Categorias,
});

function Categorias() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710]">Categorias</h1>
            <p className="text-[#4A2618]">Organização do seu cardápio</p>
          </div>
          <Button className="bg-[#E87524] hover:bg-[#C95718] text-white font-bold gap-2">
            <Plus size={20} />
            NOVA CATEGORIA
          </Button>
        </div>

        <div className="max-w-3xl space-y-4">
          <CategoryItem name="🍔 HAMBÚRGUERES" count={12} />
          <CategoryItem name="🌭 HOT DOGS" count={12} />
          <CategoryItem name="🥤 BEBIDAS" count={6} />
        </div>
      </div>
    </AdminLayout>
  );
}

function CategoryItem({ name, count }: any) {
  return (
    <Card className="border-none shadow-sm bg-white group hover:shadow-md transition-all">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-[#F3E2CC] cursor-grab active:cursor-grabbing">
            <GripVertical size={20} />
          </div>
          <div>
            <h3 className="font-black text-[#2B1710] text-lg uppercase">{name}</h3>
            <p className="text-xs text-[#4A2618]/60 font-bold">{count} produtos vinculados</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
          <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
        </div>
      </CardContent>
    </Card>
  );
}
