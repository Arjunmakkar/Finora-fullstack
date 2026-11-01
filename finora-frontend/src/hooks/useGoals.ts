import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { Goal } from '@/types';

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => (await api.get<{ goals: Goal[] }>('/goals')).data.goals,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; targetAmount: number; savedAmount?: number; monthlyContribution: number; deadline: string }) =>
      (await api.post('/goals', data)).data.goal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/goals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });
}
