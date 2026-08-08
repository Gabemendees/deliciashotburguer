import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Clock, Save, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreConfig, updateStoreConfig } from '@/lib/database.functions';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/configuracoes')({
  component: Configuracoes,
});

function Configuracoes() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(true);
  const [openingTime, setOpeningTime] = useState("18:00");
  const [closingTime, setClosingTime] = useState("23:30");

  const { data: config, isLoading } = useQuery({
    queryKey: ['store-config'],
    queryFn: () => getStoreConfig(),
  });

  const configMutation = useMutation({
    mutationFn: (data: { key: string, value: any }) => updateStoreConfig({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-config'] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: () => toast.error("Erro ao salvar configurações.")
  });

  useEffect(() => {
    if (config) {
      if (config['is_store_open'] !== undefined) setIsOpen(config['is_store_open']);
      if (config['store_hours']) {
        setOpeningTime(config['store_hours'].open);
        setClosingTime(config['store_hours'].close);
      }
    }
  }, [config]);

  const handleSave = () => {
    configMutation.mutate({ key: 'is_store_open', value: isOpen });
    configMutation.mutate({ 
      key: 'store_hours', 
      value: { open: openingTime, close: closingTime } 
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-[#E87524]" size={48} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#2B1710] uppercase tracking-tighter">Configurações da Loja</h1>
            <p className="text-[#4A2618]/60 font-bold uppercase text-xs tracking-[0.2em]">Controle geral da operação</p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={configMutation.isPending}
            className="bg-[#2B1710] hover:bg-[#1a0e0a] text-white font-black h-14 px-8 rounded-2xl gap-3 shadow-lg"
          >
            {configMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            SALVAR CONFIGURAÇÕES
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-[#2B1710] text-white p-8">
              <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tight">
                <Store size={24} className="text-[#E87524]" />
                STATUS DA OPERAÇÃO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-center justify-between p-6 bg-[#FFF4E6]/50 rounded-3xl border border-[#F3E2CC]">
                <div className="space-y-1">
                  <h3 className={cn(
                    "text-2xl font-black uppercase tracking-tighter",
                    isOpen ? "text-green-600" : "text-red-600"
                  )}>
                    {isOpen ? "LOJA ABERTA" : "LOJA FECHADA"}
                  </h3>
                  <p className="text-xs font-bold text-[#4A2618]/40 uppercase tracking-widest">
                    {isOpen ? "Os clientes podem fazer pedidos agora" : "O site informará que a loja está fechada"}
                  </p>
                </div>
                <Switch 
                  checked={isOpen}
                  onCheckedChange={setIsOpen}
                  className="data-[state=checked]:bg-green-500 scale-150"
                />
              </div>

              <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-4">
                <Info size={24} className="text-blue-500 shrink-0" />
                <p className="text-sm font-bold text-blue-700 leading-relaxed">
                  Ao fechar a loja manualmente, o botão de "Finalizar Pedido" será desativado para todos os clientes imediatamente.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-[#2B1710] text-white p-8">
              <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tight">
                <Clock size={24} className="text-[#E87524]" />
                HORÁRIO DE FUNCIONAMENTO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="font-black uppercase text-[10px] tracking-widest text-[#4A2618]/60">Abertura</Label>
                  <Input 
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="h-14 bg-[#FFF4E6]/50 border-none font-black text-xl text-[#2B1710] focus-visible:ring-[#E87524] rounded-2xl"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="font-black uppercase text-[10px] tracking-widest text-[#4A2618]/60">Fechamento</Label>
                  <Input 
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="h-14 bg-[#FFF4E6]/50 border-none font-black text-xl text-[#2B1710] focus-visible:ring-[#E87524] rounded-2xl"
                  />
                </div>
              </div>

              <div className="p-6 bg-[#FFF4E6] rounded-3xl border border-[#F3E2CC] flex items-center gap-4">
                <ShieldCheck className="text-[#E87524]" size={24} />
                <p className="text-xs font-bold text-[#4A2618]/60 uppercase tracking-wider">
                  Configuração aplicada para todos os dias da semana.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
          <CardContent className="p-12 flex flex-col items-center text-center space-y-4">
            <AlertCircle size={48} className="text-[#E87524]/20" />
            <h3 className="text-xl font-black text-[#2B1710] uppercase tracking-tighter">Histórico de Pedidos e Dados</h3>
            <p className="max-w-md text-[#4A2618]/60 font-bold text-sm leading-relaxed">
              O sistema mantém o histórico completo de todos os pedidos realizados. Nenhuma informação é excluída automaticamente para garantir a precisão do seu relatório financeiro.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
