import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { cn, formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminProducts, getAdminCategories, updateProduct, deleteProduct } from '@/lib/database.functions';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit2, Trash2, Copy, ToggleLeft as Toggle, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute('/admin/produtos')({
  component: Produtos,
});

function Produtos() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => getAdminProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => getAdminCategories(),
  });

  const productMutation = useMutation({
    mutationFn: (data: any) => updateProduct({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsModalOpen(false);
      setEditingProduct(null);
      toast.success(editingProduct ? "Produto atualizado!" : "Produto criado!");
    },
    onError: () => toast.error("Erro ao salvar produto.")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      toast.success("Produto excluído com sucesso.");
    },
    onError: () => toast.error("Erro ao excluir produto.")
  });

  const filteredProducts = products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeCategory === "TODOS") return matchesSearch;
    return matchesSearch && p.categories?.name === activeCategory;
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleToggleAvailability = (product: any) => {
    productMutation.mutate({
      ...product,
      category_id: product.category_id,
      is_available: !product.is_available
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingProduct?.id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category_id: formData.get('category_id') as string,
      image_url: formData.get('image_url') as string,
      is_available: editingProduct ? editingProduct.is_available : true,
    };
    productMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710] uppercase tracking-tighter">Gestão de Cardápio</h1>
            <p className="text-[#4A2618]/60 font-bold uppercase text-xs tracking-[0.2em]">Controle seus produtos e preços</p>
          </div>
          <Button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="bg-[#E87524] hover:bg-[#C95718] text-white font-black h-14 px-8 rounded-2xl gap-3 shadow-lg shadow-[#E87524]/20"
          >
            <Plus size={24} />
            NOVO PRODUTO
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-2 border-none shadow-sm bg-white p-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A2618]/30" size={20} />
              <Input 
                placeholder="Buscar produto..." 
                className="pl-12 h-12 bg-[#FFF4E6]/30 border-none focus-visible:ring-[#E87524] font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Card>
          <div className="lg:col-span-2 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['TODOS', ...categories.map((c: any) => c.name)].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-3 rounded-2xl text-[10px] font-black whitespace-nowrap uppercase tracking-widest transition-all",
                  cat === activeCategory 
                    ? "bg-[#2B1710] text-white shadow-lg" 
                    : "bg-white text-[#4A2618]/60 hover:bg-[#FFF4E6] hover:text-[#E87524]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-24 bg-white rounded-3xl">
            <Loader2 className="animate-spin text-[#E87524]" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product: any) => (
              <ProductRow 
                key={product.id}
                product={product}
                onEdit={() => handleEdit(product)}
                onDelete={() => { setProductToDelete(product); setIsDeleteModalOpen(true); }}
                onToggle={() => handleToggleAvailability(product)}
              />
            ))}
            {filteredProducts.length === 0 && (
              <div className="text-center p-24 bg-white rounded-3xl border-2 border-dashed border-[#F3E2CC]">
                <ImageIcon className="mx-auto text-[#F3E2CC] mb-4" size={64} />
                <p className="text-[#4A2618]/60 font-black uppercase tracking-widest">Nenhum produto encontrado</p>
                <Button variant="link" onClick={() => setIsModalOpen(true)} className="text-[#E87524] font-bold mt-2">Clique aqui para adicionar</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingProduct(null); }}>
        <DialogContent className="bg-white border-none rounded-[2rem] max-w-2xl overflow-hidden p-0">
          <form onSubmit={handleSubmit}>
            <div className="bg-[#2B1710] p-8 text-white">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
                <DialogDescription className="text-[#F3E2CC]/60 font-bold uppercase text-[10px] tracking-widest">
                  {editingProduct ? "Atualize as informações do item" : "Preencha os dados do novo item"}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4 md:col-span-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-[#4A2618]/60">Nome do Produto</Label>
                <Input 
                  name="name"
                  defaultValue={editingProduct?.name}
                  required
                  placeholder="Ex: X-Bacon Artesanal"
                  className="h-12 bg-[#FFF4E6]/50 border-none font-bold focus-visible:ring-[#E87524]"
                />
              </div>

              <div className="space-y-4">
                <Label className="font-black uppercase text-[10px] tracking-widest text-[#4A2618]/60">Preço (R$)</Label>
                <Input 
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingProduct?.price}
                  required
                  placeholder="0,00"
                  className="h-12 bg-[#FFF4E6]/50 border-none font-bold focus-visible:ring-[#E87524]"
                />
              </div>

              <div className="space-y-4">
                <Label className="font-black uppercase text-[10px] tracking-widest text-[#4A2618]/60">Categoria</Label>
                <Select name="category_id" defaultValue={editingProduct?.category_id} required>
                  <SelectTrigger className="h-12 bg-[#FFF4E6]/50 border-none font-bold focus:ring-[#E87524]">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#F3E2CC] rounded-xl shadow-xl">
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id} className="font-bold text-[#2B1710] uppercase text-xs tracking-wider cursor-pointer hover:bg-[#FFF4E6]">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 md:col-span-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-[#4A2618]/60">Descrição</Label>
                <Textarea 
                  name="description"
                  defaultValue={editingProduct?.description}
                  placeholder="Descreva os ingredientes..."
                  className="bg-[#FFF4E6]/50 border-none font-bold focus-visible:ring-[#E87524] min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-[#4A2618]/60">URL da Imagem</Label>
                <Input 
                  name="image_url"
                  defaultValue={editingProduct?.image_url}
                  placeholder="https://exemplo.com/imagem.jpg"
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
                disabled={productMutation.isPending}
                className="bg-[#E87524] hover:bg-[#C95718] text-white font-black h-12 px-8 rounded-xl"
              >
                {productMutation.isPending ? <Loader2 className="animate-spin" /> : "SALVAR ALTERAÇÕES"}
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
            <DialogTitle className="text-2xl font-black text-[#2B1710] uppercase tracking-tighter">Excluir Produto?</DialogTitle>
            <DialogDescription className="text-[#4A2618]/60 font-medium">
              Tem certeza que deseja excluir "{productToDelete?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button 
              onClick={() => deleteMutation.mutate(productToDelete?.id)}
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

function ProductRow({ product, onEdit, onDelete, onToggle }: any) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden group relative">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#FFF4E6] shrink-0 border border-[#F3E2CC] shadow-inner group-hover:scale-105 transition-transform duration-500">
              <img 
                src={product.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&auto=format&fit=crop'} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <p className="font-black text-[#2B1710] text-xl uppercase tracking-tighter leading-tight mb-1">{product.name}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="text-[9px] font-black border-[#F3E2CC] text-[#4A2618]/40 uppercase tracking-widest bg-[#FFF4E6]/50 px-2 py-0.5 rounded-lg">
                  {product.categories?.name || 'Sem Categoria'}
                </Badge>
                <span className="text-[#E87524] font-black text-lg">{formatCurrency(Number(product.price))}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
            <Badge className={cn(
              "px-4 py-2 font-black uppercase text-[10px] tracking-widest border-none rounded-xl", 
              product.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {product.is_available ? "Disponível" : "Indisponível"}
            </Badge>
            
            <div className="flex items-center gap-1 border-l border-[#F3E2CC] pl-4">
              <ActionButton icon={Edit2} onClick={onEdit} color="text-blue-500 hover:bg-blue-50" />
              <ActionButton 
                icon={Toggle} 
                onClick={onToggle}
                color={product.is_available ? "text-orange-500 hover:bg-orange-50" : "text-green-500 hover:bg-green-50"} 
              />
              <ActionButton icon={Trash2} onClick={onDelete} color="text-red-500 hover:bg-red-50" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionButton({ icon: Icon, color, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("p-3 rounded-xl transition-all hover:scale-110 active:scale-95", color)}>
      <Icon size={20} />
    </button>
  );
}
