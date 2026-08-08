import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const syncDataWithDatabase = createServerFn({ method: "GET" })
  .handler(async () => {
    // This will be used later to pull products/categories from Supabase
    // For now, we'll keep the static data for the client but prepare the logic
    return { success: true };
  });

export const getAdminProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)');
    if (error) throw error;
    return data;
  });

export const getAdminOrders = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, order_item_additions(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  });
