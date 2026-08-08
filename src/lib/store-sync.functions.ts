import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Checks if the store should be open based on the current Brasilia time (UTC-3).
 * Store hours: Monday to Saturday 19:00 to 00:00. Sunday closed.
 */
export const syncStoreStatus = createServerFn({ method: "POST" })
  .handler(async () => {
    // 1. Get current time in Brasilia (UTC-3)
    const now = new Date();
    const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    
    const day = brasiliaTime.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = brasiliaTime.getUTCHours();
    const minutes = brasiliaTime.getUTCMinutes();
    const totalMinutes = (hours * 60) + minutes;

    // Opening: 19:00 (19 * 60 = 1140 minutes)
    // Closing: 00:00 (0 or 1440 minutes)
    
    let shouldBeOpen = false;

    // Monday (1) to Saturday (6)
    if (day >= 1 && day <= 6) {
      if (totalMinutes >= 1140 || totalMinutes < 5) { // Allowing 5 mins buffer for 00:00
        shouldBeOpen = true;
      }
    }

    // 2. Update database
    const { error } = await supabaseAdmin
      .from('store_config')
      .upsert({ key: 'is_store_open', value: shouldBeOpen }, { onConflict: 'key' });

    if (error) throw error;
    
    return { isStoreOpen: shouldBeOpen, time: brasiliaTime.toISOString() };
  });
