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
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!email) {
      toast.error('E-mail obrigatório.');
      return;
    }
    if (!password) {
      toast.error('Senha obrigatória.');
      return;
    }
    
    if (email.toLowerCase() !== 'deliciahotburguers@gmail.com') {
      toast.error('E-mail ou senha incorretos.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      const { data: { session: newSession } } = await supabase.auth.getSession();
      
      if (!newSession || newSession.user.email?.toLowerCase() !== 'deliciahotburguers@gmail.com') {
        await supabase.auth.signOut();
        toast.error('Acesso negado. Apenas o administrador autorizado pode entrar.');
        return;
      }

      toast.success('Autenticação realizada com sucesso!');
      
      // Use navigate directly for SPA transition
      navigate({ to: '/admin/dashboard' });
      
    } catch (error: any) {
      console.error("AUTHENTICATION ERROR", error);
      toast.error(error.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate({ to: '/admin/dashboard' });
  };

  return (
    <div className="min-h-screen bg-[#FFF4E6] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Elements */}
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
          {session && session.user.email === 'deliciahotburguers@gmail.com' ? (
            <div className="space-y-6 text-center pt-4">
              <div className="p-5 bg-green-50 border border-green-100 rounded-3xl">
                <p className="text-green-700 font-bold text-sm">Administrador autenticado.</p>
              </div>
              <Button 
                onClick={handleGoToDashboard}
                className="w-full bg-[#E87524] hover:bg-[#C95718] text-white font-black h-14 rounded-2xl gap-3 text-lg shadow-lg shadow-[#E87524]/30 active:scale-[0.98] transition-all"
              >
                ENTRAR NO PAINEL
                <LogIn className="group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="text-[#4A2618]/30 font-bold uppercase text-[10px] tracking-widest hover:text-[#E87524] transition-colors"
              >
                Sair da conta
              </button>
            </div>
          ) : (
            <form 
              onSubmit={handleLogin}
              className="space-y-6 pt-4"
            >
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4A2618]/20 group-focus-within:text-[#E87524] transition-colors">
                    <Mail size={18} />
                  </div>
                  <Input 
                    type="email"
                    placeholder="E-mail Administrativo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-16 bg-[#FFF4E6]/50 border-none rounded-2xl font-bold pl-14 placeholder:text-[#4A2618]/20 focus-visible:ring-2 focus-visible:ring-[#E87524]/20 text-[#2B1710]"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#4A2618]/20 group-focus-within:text-[#E87524] transition-colors">
                    <Lock size={18} />
                  </div>
                  <Input 
                    type="password"
                    placeholder="Senha de Acesso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-16 bg-[#FFF4E6]/50 border-none rounded-2xl font-bold pl-14 placeholder:text-[#4A2618]/20 focus-visible:ring-2 focus-visible:ring-[#E87524]/20 text-[#2B1710]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
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

              <div className="text-center pt-2">
                <p className="text-[#4A2618]/20 font-bold text-[9px] uppercase tracking-[0.2em]">
                  PROTEGIDO POR CRIPTOGRAFIA DE PONTA A PONTA
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <p className="absolute bottom-8 text-[#4A2618]/20 font-black uppercase text-[10px] tracking-[0.3em]">
        DELÍCIA'S HOT BURGUER'S SYSTEM V2.0
      </p>
    </div>
  );
}

