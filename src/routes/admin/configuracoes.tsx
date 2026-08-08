import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Store, Clock, Phone, Globe, Bell } from 'lucide-react';

export const Route = createFileRoute('/admin/configuracoes')({
  component: Configuracoes,
});

function Configuracoes() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-[#2B1710]">Configurações</h1>
          <p className="text-[#4A2618]">Gerencie as informações básicas da sua loja</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2B1710]">
                  <Store size={20} className="text-[#E87524]" />
                  DADOS DA LOJA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Nome da Hamburgueria</Label>
                  <Input defaultValue="Delícia's Hot Burguer's" className="bg-[#FFF4E6]/50 border-none" />
                </div>
                <div className="grid gap-2">
                  <Label>WhatsApp para Pedidos</Label>
                  <Input defaultValue="9.9701-3096" className="bg-[#FFF4E6]/50 border-none" />
                </div>
                <div className="grid gap-2">
                  <Label>Endereço Completo</Label>
                  <Textarea defaultValue="R. Santa Maria, 714, Pedra Azul, Contagem - MG" className="bg-[#FFF4E6]/50 border-none resize-none" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2B1710]">
                  <Clock size={20} className="text-[#E87524]" />
                  FUNCIONAMENTO
                </CardTitle>
                <CardDescription>Configure quando seu cardápio está visível para pedidos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#FFF4E6]/50 rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#2B1710]">Status da Loja</span>
                    <span className="text-xs text-[#4A2618]/60">Fechar a loja bloqueia novos pedidos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-green-500 uppercase">ABERTA</span>
                    <Switch defaultChecked className="data-[state=checked]:bg-green-500" />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>Horários (Exibição no Rodapé)</Label>
                  <Input defaultValue="Segunda a sábado: 19:00 às 00:00" className="bg-[#FFF4E6]/50 border-none" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2B1710]">
                  <Bell size={20} className="text-[#E87524]" />
                  NOTIFICAÇÕES
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border-b border-[#F3E2CC]">
                  <Label className="font-bold">Som para Novos Pedidos</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border-b border-[#F3E2CC]">
                  <Label className="font-bold">Notificações no Navegador</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2B1710]">
                  <Globe size={20} className="text-[#E87524]" />
                  TEMPOS ESTIMADOS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Tempo de Preparo (minutos)</Label>
                  <Input type="number" defaultValue="20" className="bg-[#FFF4E6]/50 border-none" />
                </div>
                <div className="grid gap-2">
                  <Label>Tempo de Entrega (minutos)</Label>
                  <Input type="number" defaultValue="45" className="bg-[#FFF4E6]/50 border-none" />
                </div>
              </CardContent>
            </Card>

            <Button className="w-full bg-[#E87524] hover:bg-[#C95718] text-white font-black h-14 shadow-lg">
              SALVAR TODAS AS CONFIGURAÇÕES
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
