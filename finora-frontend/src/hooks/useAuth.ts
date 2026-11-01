import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => setAuth(data.user),
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const res = await api.post('/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => setAuth(data.user),
  });
}

export function useGoogleLoginMutation() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (credential: string) => {
      const res = await api.post('/auth/google', { credential });
      return res.data;
    },
    onSuccess: (data) => setAuth(data.user),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      logout();
      qc.clear();
    },
  });
}

export function useDeleteAccount() {
  const logout = useAuthStore((s) => s.logout);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete('/auth/me');
    },
    onSettled: () => {
      logout();
      qc.clear();
    },
  });
}

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
          return res.data.user;
        }
        return null;
      } catch (err: any) {
        if (err.response?.status === 401) {
          setUser(null);
        }
        throw err;
      }
    },
    retry: false,
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; currency?: string }) => (await api.patch('/auth/me', data)).data.user,
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
