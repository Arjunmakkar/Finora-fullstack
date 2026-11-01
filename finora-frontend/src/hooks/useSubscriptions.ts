import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { Subscription } from '@/types';

export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => (await api.get<{ subscriptions: Subscription[]; monthlyTotal: number; annualTotal: number }>('/subscriptions')).data,
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; price: number; billingCycle: string; nextPayment: string; category: string; paymentMethod?: string }) =>
      (await api.post('/subscriptions', data)).data.subscription,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  });
}

export function useDeleteSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/subscriptions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  });
}
