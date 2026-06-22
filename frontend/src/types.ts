export interface Card {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  ownerId: string;
  memberIds: string[];
}

export type Role = 'owner' | 'editor' | 'viewer';

export interface BoardMember {
  userId: string;
  boardId: string;
  role: Role;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
