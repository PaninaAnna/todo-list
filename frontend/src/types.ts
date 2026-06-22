export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface Card {
  id: string;
  title: string;
  description: string;
  tags: string[];
  checklists: Checklist[];
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface ArchivedCard {
  id: string;
  title: string;
  description: string;
  tags: string[];
  checklists: Checklist[];
  columnId: string;
  columnTitle: string;
}

export interface ArchivedColumn {
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
  archivedCards: ArchivedCard[];
  archivedColumns: ArchivedColumn[];
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
