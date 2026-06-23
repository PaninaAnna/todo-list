import { api, setToken } from './client';

export async function register(email: string, password: string, name: string) {
  const data = await api.post('/auth/register', { email, password, name });
  setToken(data.token);
  return data.user;
}

export async function login(email: string, password: string) {
  const data = await api.post('/auth/login', { email, password });
  setToken(data.token);
  return data.user;
}

export async function getMe() {
  return api.get('/auth/me');
}

export async function updateProfile(name: string) {
  return api.put('/auth/profile', { name });
}
