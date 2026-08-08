import { createFileRoute, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/admin')({
  component: AdminGateway,
});

function AdminGateway() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user.email?.toLowerCase() === 'deliciahotburguers@gmail.com') {
        window.location.replace('/admin/dashboard');
      } else {
        window.location.replace('/admin/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return null;
}
