import { useEffect } from 'react';
import { supabase } from '@/integrations/external-supabase/client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to set up realtime subscriptions for lab_requests and delivery_requests tables.
 * Automatically invalidates React Query cache when data changes.
 * This is a single global subscription - should only be called once at app root level.
 */
export const useRealtimeSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to lab_requests changes
    const labRequestsChannel = supabase
      .channel('lab-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lab_requests',
        },
        (payload) => {
          console.log('Lab requests changed:', payload.eventType);
          // Invalidate React Query cache - single source of truth
          queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
        }
      )
      .subscribe();

    // Subscribe to delivery_requests changes
    const deliveryRequestsChannel = supabase
      .channel('delivery-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_requests',
        },
        (payload) => {
          console.log('Delivery requests changed:', payload.eventType);
          // Invalidate React Query cache - single source of truth
          queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });
        }
      )
      .subscribe();

    // Subscribe to catalog entries changes
    const catalogEntriesChannel = supabase
      .channel('catalog-entries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lab_catalog_entries',
        },
        (payload) => {
          console.log('Catalog entries changed:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-public'] });
        }
      )
      .subscribe();

    // Subscribe to catalog categories changes
    const catalogCategoriesChannel = supabase
      .channel('catalog-categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lab_catalog_categories',
        },
        (payload) => {
          console.log('Catalog categories changed:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['lab-catalog-categories-public'] });
          queryClient.invalidateQueries({ queryKey: ['lab-catalog-categories'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(labRequestsChannel);
      supabase.removeChannel(deliveryRequestsChannel);
      supabase.removeChannel(catalogEntriesChannel);
      supabase.removeChannel(catalogCategoriesChannel);
    };
  }, [queryClient]);
};
