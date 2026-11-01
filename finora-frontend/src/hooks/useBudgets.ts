import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { Budget } from '@/types';

export function useBudgets(month?: string) {
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: async () => (await api.get<{ budgets: Budget[] }>('/budgets', { params: { month } })).data.budgets,
  });
}

export function useSaveBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { category: string; month?: string; limitAmount: number }) =>
      (await api.post('/budgets', data)).data.budget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/budgets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  });
}
