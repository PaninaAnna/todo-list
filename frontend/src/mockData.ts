import type { Board } from './types';

export const mockBoard: Board = {
  id: '1',
  title: 'Моя первая доска',
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
};
