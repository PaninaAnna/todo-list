import { api } from './client';

export async function getBoards() {
  return api.get('/boards');
}

export async function createBoard(title: string) {
  return api.post('/boards', { title });
}

export async function updateBoard(id: string, data: any) {
  return api.put(`/boards/${id}`, data);
}

export async function deleteBoard(id: string) {
  return api.delete(`/boards/${id}`);
}
