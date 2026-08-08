import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, ToggleLeft as Toggle, Loader2, PlusCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminAdditions, updateAddition, deleteAddition } from '@/lib/database.functions';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";

export const Route = createFileRoute('/admin/acrescimos')({
  component: Acrescimos,
});

function Acrescimos() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddition, setEditingAddition] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [additionToDelete, setAdditionToDelete] = useState<any>(null);

  const { data: additions = [], isLoading } = useQuery({
    queryKey: ['admin-additions'],
    queryFn: () => getAdminAdditions(),
  });

  const additionMutation = useMutation({
    mutationFn: (data: any) => updateAddition({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-additions'] });
      setIsModalOpen(false);
      setEditingAddition(null);
      toast.success(editingAddition ? "Acréscimo atualizado!" : "Acréscimo criado!");
    },
    onError: () => toast.error("Erro ao salvar acréscimo.")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAddition({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-additions'] });
      setIsDeleteModalOpen(false);
      setAdditionToDelete(null);
      toast.success("Acréscimo excluído!");
    },
    onError: () => toast.error("Erro ao excluir acréscimo.")
  });

  const handleEdit = (addition: any) => {
    setEditingAddition(addition);
    setIsModalOpen(true);
  };

  const handleToggleAvailability = (addition: any) => {
    additionMutation.mutate({
      ...addition,
      is_available: !addition.is_available
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingAddition?.id,
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      is_available: editingAddition ? editingAddition.is_available : true,
    };
    additionMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710] uppercase tracking-tighter">Gestão de Acréscimos</h1>
            <p className="text-[#4A2618]/60 font-bold uppercase text-xs tracking-[0.2em]">Personalização e opcionais</p>
          </div>
          <Button 
            onClick={() => { setEditingAddition(null); setIsModalOpen(true); }}
            className="bg-[#E87524] hover:bg-[#C95718] text-white font-black h-14 px-8 rounded-2xl gap-3 shadow-lg shadow-[#E87524]/20"
          >
            <Plus size={24} />
            NOVO ACRÉSCIMO
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-24 bg-white rounded-3xl">
            <Loader2 className="animate-spin text-[#E87524]" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additions.map((addition: any) => (
              <AdditionCard 
                key={addition.id} 
                addition={addition} 
                onEdit={() => handleEdit(addition)}
                onDelete={() => { setAdditionToDelete(addition); setIsDeleteModalOpen(true); }}
                onToggle={() => handleToggleAvailability(addition)}
              />
            ))}
            {additions.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 text-center p-24 bg-white rounded-3xl border-2 border-dashed border-[#F3E2CC]">
                <PlusCircle className="mx-auto text-[#F3E2CC] mb-4" size={64} />
                <p className="text-[#4A2618]/60 font-black uppercase tracking-widest">Nenhum acréscimo cadastrado</p>
                <Button variant="link" onClick={() => setIsModalOpen(true)} className="text-[#E87524] font-bold mt-2">Clique aqui para adicionar</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Addition Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingAddition(null); }}>
        <DialogContent className="bg-white border-none rounded-[2rem] max-w-md overflow-hidden p-0">
          <form onSubmit={handleSubmit}>
            <div className="bg-[#2B1710] p-8 text-white">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                  {editingAddition ? "Editar Acréscimo" : "Novo Acréscimo"}
                </DialogTitle>
                <DialogDescription className="text-[#F3E2CC]/60 font-bold uppercase text-[10px] tracking-widest">
                  Configure os detalhes do adicional
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <Label className="font-black uppercase text-[10px] tracking-widest text-[#4A2618]/60">Nome</Label>
                <Input 
                  name="name"
                  defaultValue={editingAddition?.name}
                  required
                  placeholder="Ex: Bacon Extra"
                  className="h-12 bg-[#FFF4E6]/50 border-none font-bold focus-visible:ring-[#E87524]"
                />
              </div>

              <div className="space-y-4">
                <Label className="font-black uppercase text-[10px] tracking-widest text-[#4A2618]/60">Preço Extra (R$)</Label>
                <Input 
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingAddition?.price}
                  required
                  placeholder="0,00"
                  className="h-12 bg-[#FFF4E6]/50 border-none font-bold focus-visible:ring-[#E87524]"
                />
              </div>
            </div>

            <DialogFooter className="p-8 pt-0 gap-3">
              <Button 
                type="button"
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="font-black uppercase text-xs tracking-widest text-[#4A2618]/40 hover:bg-[#FFF4E6]"
              >
                CANCELAR
              </Button>
              <Button 
                type="submit"
                disabled={additionMutation.isPending}
                className="bg-[#E87524] hover:bg-[#C95718] text-white font-black h-12 px-8 rounded-xl"
              >
                {additionMutation.isPending ? <Loader2 className="animate-spin" /> : "SALVAR ACRÉSCIMO"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-white border-none rounded-3xl max-w-sm">
          <DialogHeader className="items-center text-center pb-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} />
            </div>
            <DialogTitle className="text-2xl font-black text-[#2B1710] uppercase tracking-tighter">Excluir?</DialogTitle>
            <DialogDescription className="text-[#4A2618]/60 font-medium">
              Deseja excluir "{additionToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button 
              onClick={() => deleteMutation.mutate(additionToDelete?.id)}
              disabled={deleteMutation.isPending}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black h-12 rounded-xl"
            >
              {deleteMutation.isPending ? <Loader2 className="animate-spin" /> : "SIM, EXCLUIR"}
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
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

function AdditionCard({ addition, onEdit, onDelete, onToggle }: any) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-300 rounded-[1.5rem] border border-transparent hover:border-[#E87524]/10">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-[#2B1710] text-2xl uppercase tracking-tighter truncate max-w-[150px]">{addition.name}</h3>
          <Badge className={cn(
            "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border-none", 
            addition.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {addition.is_available ? "DISPONÍVEL" : "INDISPONÍVEL"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#4A2618]/40 uppercase tracking-widest mb-1">Preço adicional</span>
            <span className="text-3xl font-black text-[#E87524] tracking-tighter">{formatCurrency(Number(addition.price))}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-all hover:scale-110"><Edit2 size={20} /></button>
            <button onClick={onToggle} className={cn("p-3 rounded-xl transition-all hover:scale-110", addition.is_available ? "text-orange-500 hover:bg-orange-50" : "text-green-500 hover:bg-green-50")}>
              <Toggle size={20} />
            </button>
            <button onClick={onDelete} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110"><Trash2 size={20} /></button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}