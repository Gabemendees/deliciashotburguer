import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/lib/order.functions';
import { Header } from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import { Check, Truck, Store, MapPin, ArrowLeft, ShoppingBag } from 'lucide-react';
import { z } from 'zod';
import { STORE_ADDRESS } from '@/lib/data';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/pedido-concluido')({
  validateSearch: (search) => z.object({
    id: z.string().uuid()
  }).parse(search),
  component: OrderCompletedPage
});

function OrderCompletedPage() {
  const { id } = Route.useSearch();
  
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById({ data: id }),
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF4E6] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-8 border-[#E87524] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-[#2B1710] uppercase tracking-tighter">Carregando seu pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FFF4E6] flex flex-col items-center justify-center p-4">
        <Header />
        <div className="bg-white p-12 rounded-[40px] shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-black text-[#2B1710] mb-4">Pedido não encontrado!</h2>
          <Link to="/">
            <Button variant="burger">Voltar ao Cardápio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF4E6] flex flex-col pb-12">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Sucesso Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500 text-white mb-6 shadow-xl shadow-green-500/20 border-8 border-white">
            <Check size={48} strokeWidth={4} />
          </div>
          <h1 className="text-4xl font-black text-[#2B1710] uppercase tracking-tighter italic mb-2">
            PEDIDO CONCLUÍDO!
          </h1>
          <p className="text-[#4A2618] font-bold text-lg mb-1">
            Seu pedido foi recebido com sucesso!
          </p>
          <p className="text-[#E87524] font-black uppercase tracking-widest text-xs">
            Agora é só aguardar. Em breve começaremos a preparar seu pedido.
          </p>
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-white rounded-[40px] shadow-xl shadow-[#2B1710]/5 border border-[#F3E2CC] overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="bg-[#2B1710] p-6 text-white flex justify-between items-center">
            <span className="font-black uppercase tracking-widest text-sm">Resumo do Pedido</span>
            <span className="font-black text-xl italic tracking-tighter">PEDIDO #{String((order as any).order_number || order.id.slice(0, 4)).toUpperCase()}</span>
          </div>
          
          <div className="p-8">
            {/* Itens */}
            <div className="space-y-6 mb-8">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-12 h-12 bg-[#FFF4E6] rounded-xl flex items-center justify-center shrink-0 border border-[#F3E2CC]">
                    <span className="font-black text-[#E87524]">{item.quantity}x</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-black text-[#2B1710] uppercase italic tracking-tighter truncate">
                        {item.name}
                      </h3>
                      <span className="font-bold text-[#2B1710]">{formatCurrency(item.total_price)}</span>
                    </div>
                    
                    {/* Acréscimos */}
                    {item.order_item_additions && item.order_item_additions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.order_item_additions.map((add: any, idx: number) => (
                          <span key={idx} className="text-[10px] font-black bg-[#FFF4E6] text-[#E87524] px-2 py-0.5 rounded-full uppercase">
                            + {add.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {item.observation && (
                      <p className="text-[10px] text-[#4A2618]/70 italic mt-1">
                        Obs: {item.observation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="space-y-3 pt-6 border-t border-dashed border-[#F3E2CC] mb-8">
              <div className="flex justify-between text-sm font-bold text-[#4A2618] uppercase tracking-tighter">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#4A2618] uppercase tracking-tighter">
                <span>Taxa de Entrega</span>
                <span>{order.delivery_type === 'pickup' ? 'R$ 0,00' : formatCurrency(order.delivery_fee || 0)}</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-[#F3E2CC]">
                <span className="font-black text-[#2B1710] uppercase italic">Valor Total</span>
                <span className="text-3xl font-black text-[#E87524] tracking-tighter leading-none">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>

            {/* Pagamento e Entrega */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#FFF4E6] rounded-3xl border border-[#E87524]/10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    {order.delivery_type === 'delivery' ? <Truck className="w-5 h-5 text-[#E87524]" /> : <Store className="w-5 h-5 text-[#E87524]" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#E87524] uppercase tracking-widest">Modalidade</p>
                    <p className="font-black text-[#2B1710] uppercase italic">
                      {order.delivery_type === 'delivery' ? '🛵 Entrega' : '🚗 Retirada no Local'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <ShoppingBag className="w-5 h-5 text-[#E87524]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#E87524] uppercase tracking-widest">Forma de Pagamento</p>
                    <p className="font-black text-[#2B1710] uppercase italic">
                      {order.payment_method === 'cash' ? 'Dinheiro' : order.payment_method === 'pix' ? 'PIX' : 'Cartão'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <MapPin className="w-5 h-5 text-[#E87524]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#E87524] uppercase tracking-widest">
                    {order.delivery_type === 'delivery' ? 'Endereço de Entrega' : 'Local de Retirada'}
                  </p>
                  {order.delivery_type === 'delivery' ? (
                    <div className="text-xs font-bold text-[#4A2618] leading-tight">
                      {order.address_street}, {order.address_number}<br />
                      {order.address_neighborhood}<br />
                      {order.address_zip && `${order.address_zip} - `}{order.address_city || 'Contagem'}/{order.address_state || 'MG'}
                      {order.address_reference && (
                        <p className="mt-1 text-[#E87524] font-black italic">Ref: {order.address_reference}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-[#4A2618] leading-tight">
                      {STORE_ADDRESS.street}, {STORE_ADDRESS.number}<br />
                      {STORE_ADDRESS.neighborhood}<br />
                      {STORE_ADDRESS.city}/{STORE_ADDRESS.state}<br />
                      {STORE_ADDRESS.zip}
                      <p className="mt-1 text-[#E87524] font-black italic">Ref: {STORE_ADDRESS.reference}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Final */}
        <Link to="/">
          <Button 
            variant="burger" 
            size="xl" 
            className="w-full h-16 rounded-[40px] shadow-lg shadow-[#E87524]/20 group uppercase italic font-black"
          >
            <ArrowLeft className="mr-3 group-hover:-translate-x-1 transition-transform" />
            VOLTAR AO CARDÁPIO
          </Button>
        </Link>
      </main>
    </div>
  );
}
