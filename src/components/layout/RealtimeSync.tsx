'use client';

import { useEffect } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function RealtimeSync() {
  const { syncWithSupabase } = useNaviStore();

  useEffect(() => {
    // 1. Langsung sinkron saat aplikasi dibuka di perangkat manapun
    syncWithSupabase();

    // 2. Pasang pendengar Realtime Supabase (WebSocket)
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const channel = supabase
        .channel('navi-realtime-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            console.log('Realtime change detected:', payload);
            syncWithSupabase();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [syncWithSupabase]);

  return null;
}
