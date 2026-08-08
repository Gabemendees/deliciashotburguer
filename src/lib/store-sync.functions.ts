import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Checks if the store should be open based on the current Brasilia time (UTC-3).
 * Store hours: Monday to Saturday 19:00 to 00:00. Sunday closed.
 */
export const syncStoreStatus = createServerFn({ method: "POST" })
  .handler(async () => {
    // 1. Get current time in UTC
    const now = new Date();
    
    // 2. Adjust to Brasilia Time (UTC-3)
    // We use Intl to get the offset correctly or just subtract 3 hours 
    // since Brasilia does not have DST anymore.
    const brTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    
    const day = brTime.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = brTime.getUTCHours();
    const minutes = brTime.getUTCMinutes();
    const totalMinutes = (hours * 60) + minutes;

    // Opening: 19:00 (19 * 60 = 1140 minutes)
    // Closing: 00:00 (0 or 1440 minutes)
    
    let shouldBeOpen = false;

    // Monday (1) to Saturday (6)
    // The range 19:00 to 00:00 is within the SAME UTC day if we just look at the 19-24 range.
    if (day >= 1 && day <= 6) {
      if (totalMinutes >= 1140 && totalMinutes < 1440) {
        shouldBeOpen = true;
      }
    }

    // 3. Update database if the current status is different to avoid unnecessary writes
    // First, get the current state
    const { data: currentConfig } = await supabaseAdmin
      .from('store_config')
      .select('value')
      .eq('key', 'is_store_open')
      .single();

    if (currentConfig?.value !== shouldBeOpen) {
      await supabaseAdmin
        .from('store_config')
        .upsert({ key: 'is_store_open', value: shouldBeOpen }, { onConflict: 'key' });
    }
    
    return { isStoreOpen: shouldBeOpen, brTime: brTime.toISOString() };
  });
