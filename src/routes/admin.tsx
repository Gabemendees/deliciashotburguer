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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

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
    
    // Attempt to open the window early to prevent popup blocking.
    const dashboardWindow = window.open('about:blank', '_blank');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        dashboardWindow?.close();
        throw error;
      }
      
      // Re-verify session
      const { data: { session: newSession } } = await supabase.auth.getSession();
      
      if (!newSession || newSession.user.email?.toLowerCase() !== 'deliciahotburguers@gmail.com') {
        dashboardWindow?.close();
        await supabase.auth.signOut();
        toast.error('Acesso negado. Apenas o administrador autorizado pode entrar.');
        return;
      }

      toast.success('Autenticação realizada com sucesso!');
      
      if (dashboardWindow) {
        dashboardWindow.location.href = '/admin/dashboard';
      } else {
        window.open('/admin/dashboard', '_blank');
      }
      
    } catch (error: any) {
      dashboardWindow?.close();
      toast.error('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    window.open('/admin/dashboard', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FFF4E6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E87524]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2B1710]/5 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden relative z-10">
        <div className="bg-[#2B1710] p-10 text-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E87524] to-transparent" />
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Lock className="text-[#E87524]" size={40} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Painel do Dono</h1>
          <p className="text-[#F3E2CC]/60 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Controle Total da Hamburgueria</p>
        </div>

        <CardContent className="p-10">
          {session && session.user.email === 'deliciahotburguers@gmail.com' ? (
            <div className="space-y-6 text-center">
              <div className="p-6 bg-green-50 border border-green-100 rounded-3xl">
                <p className="text-green-700 font-bold text-sm">Você já está autenticado como administrador.</p>
              </div>
              <Button 
                onClick={handleGoToDashboard}
                className="w-full bg-[#E87524] hover:bg-[#C95718] text-white font-black h-14 rounded-2xl gap-3 text-lg group shadow-lg shadow-[#E87524]/20"
              >
                ENTRAR NO PAINEL
                <ExternalLink className="group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="ghost"
                onClick={() => supabase.auth.signOut()}
                className="text-[#4A2618]/40 font-bold uppercase text-[10px] tracking-widest hover:bg-[#FFF4E6]"
              >
                Sair da conta
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A2618]/30" size={20} />
                  <Input 
                    type="email"
                    placeholder="E-mail Administrativo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 bg-[#FFF4E6]/50 border-none rounded-2xl font-bold focus-visible:ring-[#E87524] text-[#2B1710]"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A2618]/30" size={20} />
                  <Input 
                    type="password"
                    placeholder="Senha de Acesso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 h-14 bg-[#FFF4E6]/50 border-none rounded-2xl font-bold focus-visible:ring-[#E87524] text-[#2B1710]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#E87524] hover:bg-[#C95718] text-white font-black h-14 rounded-2xl gap-3 text-lg group shadow-lg shadow-[#E87524]/20"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {loading ? 'ENTRANDO...' : 'ENTRAR NO PAINEL'}
                    {!loading && <LogIn className="group-hover:translate-x-1 transition-transform" size={20} />}

                  </>
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="text-[#4A2618]/30 font-bold text-[10px] uppercase tracking-widest">
                  Protegido por Criptografia de Ponta a Ponta
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      
      <p className="absolute bottom-8 text-[#4A2618]/20 font-black uppercase text-[10px] tracking-[0.3em]">
        Delícia's Hot Burguer's System v2.0
      </p>
    </div>
  );
}
