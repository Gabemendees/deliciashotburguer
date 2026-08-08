import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCart } from '@/lib/store';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Mail, Loader2, LogIn, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin')({
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session && session.user.email?.toLowerCase() === 'deliciahotburguers@gmail.com') {
        window.location.replace('/admin/dashboard');
      }
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (session && session.user.email?.toLowerCase() === 'deliciahotburguers@gmail.com') {
        if (window.location.pathname === '/admin') {
          window.location.replace('/admin/dashboard');
        }
      }
      setSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      console.log('Botão clicado, iniciando handleLogin...');
      
      if (!email || !password) {
        toast.error('Preencha e-mail e senha.');
        return;
      }
      
      if (email.toLowerCase() !== 'deliciahotburguers@gmail.com') {
        toast.error('Acesso negado.');
        return;
      }

      setLoading(true);
      
      console.log('Tentando login com Supabase:', email);
      
      // Limpar sessão antiga antes de tentar uma nova
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no signInWithPassword:', error);
        throw error;
      }
      
      console.log('Login bem-sucedido, aguardando propagação da sessão...');
      
      // Pequena pausa para o localStorage propagar
      await new Promise(r => setTimeout(r, 1000));
      
      const { data: { session: newSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao buscar sessão após login:', sessionError);
        throw sessionError;
      }

      console.log('Sessão encontrada:', newSession?.user?.email);
      
      if (!newSession || newSession.user.email?.toLowerCase() !== 'deliciahotburguers@gmail.com') {
        console.warn('E-mail da sessão não autorizado:', newSession?.user?.email);
        await supabase.auth.signOut();
        toast.error('E-mail não autorizado para acesso administrativo.');
        return;
      }

      console.log('Sessão válida. Redirecionando com hard reload...');
      window.location.href = '/admin/dashboard';
      
    } catch (error: any) {
      console.error('Catch error handleLogin:', error);
      toast.error('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF4E6] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E87524]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2B1710]/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-[420px] bg-[#2B1710] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="p-10 text-center relative">
          <div className="w-20 h-20 bg-white rounded-[1.5rem] mx-auto mb-6 flex items-center justify-center shadow-xl">
            <Lock className="text-[#E87524]" size={36} />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">PAINEL DO DONO</h1>
          <p className="text-[#F3E2CC]/40 font-bold uppercase text-[10px] tracking-[0.2em] mt-3">CONTROLE TOTAL DA HAMBURGUERIA</p>
        </div>

        <div className="bg-white p-8 px-10 pb-12 rounded-t-[2.5rem]">
            <form 
              onSubmit={handleLogin}
              className="space-y-6 pt-4"
              id="admin-login-form"
            >
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4A2618]/20 group-focus-within:text-[#E87524] transition-colors z-10">
                    <Mail size={18} />
                  </div>
                  <Input 
                    type="email"
                    placeholder="E-mail Administrativo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-16 bg-[#FFF4E6]/50 border-2 border-transparent focus:border-[#E87524]/20 rounded-2xl font-bold pl-14 placeholder:text-[#4A2618]/20 focus-visible:ring-0 text-[#2B1710] transition-all"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4A2618]/20 group-focus-within:text-[#E87524] transition-colors z-10">
                    <Lock size={18} />
                  </div>
                  <Input 
                    type="password"
                    placeholder="Senha de Acesso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-16 bg-[#FFF4E6]/50 border-2 border-transparent focus:border-[#E87524]/20 rounded-2xl font-bold pl-14 placeholder:text-[#4A2618]/20 focus-visible:ring-0 text-[#2B1710] transition-all"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                form="admin-login-form"
                disabled={loading}
                className="w-full bg-[#E87524] hover:bg-[#C95718] text-white font-black h-16 rounded-2xl gap-3 text-lg shadow-lg shadow-[#E87524]/30 active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    ENTRANDO...
                  </>
                ) : (
                  <>
                    ENTRAR NO PAINEL
                    <LogIn size={20} />
                  </>
                )}
              </Button>
            </form>
        </div>
      </div>
      
      <p className="absolute bottom-8 text-[#4A2618]/20 font-black uppercase text-[10px] tracking-[0.3em]">
        DELÍCIA'S HOT BURGUER'S SYSTEM V2.0
      </p>
    </div>
  );
}