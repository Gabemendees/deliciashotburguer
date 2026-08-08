import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const syncDataWithDatabase = createServerFn({ method: "GET" })
  .handler(async () => {
    return { success: true };
  });

export const getAdminProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('products' as any)
      .select('*, categories(*)');
    if (error) throw error;
    return data;
  });

export const getAdminOrders = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('orders' as any)
      .select('*, order_items(*, order_item_additions(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  });
