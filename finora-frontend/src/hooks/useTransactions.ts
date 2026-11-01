import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { Transaction } from '@/types';

interface TxFilters {
  range?: string;
  category?: string;
  search?: string;
  sort?: string;
}

export function useTransactions(filters: TxFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => (await api.get<{ transactions: Transaction[] }>('/transactions', { params: filters })).data.transactions,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Transaction> & { amount: number; type: string; category: string; description: string; date: string }) =>
      (await api.post('/transactions', data)).data.transaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['financial-health'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Transaction> }) =>
      (await api.patch(`/transactions/${id}`, data)).data.transaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
