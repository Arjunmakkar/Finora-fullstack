import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { DashboardSummary, FinancialHealth } from '@/types';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => (await api.get<DashboardSummary>('/analytics/summary')).data,
  });
}

export function useNetWorthSeries(range: string) {
  return useQuery({
    queryKey: ['analytics', 'net-worth', range],
    queryFn: async () => (await api.get('/analytics/net-worth', { params: { range } })).data.series as { date: string; value: number }[],
  });
}

export function useCashFlow() {
  return useQuery({
    queryKey: ['analytics', 'cash-flow'],
    queryFn: async () => (await api.get('/analytics/cash-flow')).data.series as { month: string; income: number; expenses: number }[],
  });
}

export function useSpendingBreakdown(range: string) {
  return useQuery({
    queryKey: ['analytics', 'spending-breakdown', range],
    queryFn: async () =>
      (await api.get('/analytics/spending-breakdown', { params: { range } })).data.breakdown as {
        category: string;
        amount: number;
        percentage: number;
        changePercent: number | null;
      }[],
  });
}

export function useFinancialHealth() {
  return useQuery({
    queryKey: ['financial-health'],
    queryFn: async () => (await api.get<FinancialHealth>('/financial-health')).data,
  });
}

export function useAskFinora() {
  return useMutation({
    mutationFn: async (question: string) => (await api.post('/assistant/query', { question })).data as { answer: string; data: unknown },
  });
}
