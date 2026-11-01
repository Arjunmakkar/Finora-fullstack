import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { Investment } from '@/types';

export function useInvestments() {
  return useQuery({
    queryKey: ['investments'],
    queryFn: async () => (await api.get<{ investments: Investment[] }>('/investments')).data.investments,
  });
}

export function useInvestmentSummary() {
  return useQuery({
    queryKey: ['investments', 'summary'],
    queryFn: async () => (await api.get('/investments/summary')).data,
  });
}

export function useCreateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Investment, 'id' | 'invested' | 'currentValue' | 'profitLoss' | 'returnPercent'>) =>
      (await api.post('/investments', data)).data.investment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investments'] }),
  });
}

export function useDeleteInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/investments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investments'] }),
  });
}
