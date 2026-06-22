import type { Board, User } from './types';

export const mockUser: User = {
  id: 'user-1',
  email: 'owner@test.com',
  name: 'Анна',
};

export const mockBoards: Board[] = [
  {
    id: 'board-1',
    title: 'Учебный проект',
    ownerId: 'user-1',
    memberIds: [],
    archivedCards: [],
    archivedColumns: [],
    columns: [
      {
        id: 'col-1',
        title: 'To Do',
        cards: [
          { id: 'card-1', title: 'Настроить проект', description: 'Vite + React + Tailwind', tags: ['фронтенд'] },
          { id: 'card-2', title: 'Сделать вёрстку', description: 'Компоненты доски', tags: ['дизайн'] },
        ],
      },
      {
        id: 'col-2',
        title: 'In Progress',
        cards: [
          { id: 'card-3', title: 'Drag & drop', description: 'Перетаскивание карточек', tags: ['фронтенд', 'логика'] },
        ],
      },
      {
        id: 'col-3',
        title: 'Done',
        cards: [
          { id: 'card-4', title: 'Репозиторий', description: 'Создан и настроен', tags: ['инфра'] },
        ],
      },
    ],
  },
  {
    id: 'board-2',
    title: 'Домашние дела',
    ownerId: 'user-1',
    memberIds: [],
    archivedCards: [],
    archivedColumns: [],
    columns: [
      {
        id: 'col-4',
        title: 'Купить',
        cards: [
          { id: 'card-5', title: 'Молоко', description: '', tags: ['продукты'] },
          { id: 'card-6', title: 'Хлеб', description: '', tags: ['продукты'] },
        ],
      },
      {
        id: 'col-5',
        title: 'Сделать',
        cards: [
          { id: 'card-7', title: 'Погладить', description: '', tags: ['дом'] },
        ],
      },
    ],
  },
];
