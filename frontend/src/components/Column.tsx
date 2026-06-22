import { useState } from 'react';
import type { Column as ColumnType } from '../types';
import Card from './Card';

interface ColumnProps {
  column: ColumnType;
  onAddCard: (columnId: string, title: string) => void;
}

export default function Column({ column, onAddCard }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddCard(column.id, newTitle);
      setNewTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4 w-72 flex-shrink-0">
      <h3 className="font-semibold text-gray-700 mb-3">{column.title}</h3>
      <div className="space-y-2 mb-3">
        {column.cards.map((card, index) => (
          <Card key={card.id} card={card} index={index} />
        ))}
      </div>

      {isAdding ? (
        <div className="space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Название карточки"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewTitle('');
              }
            }}
          />
          <div className="flex gap-1">
            <button
              onClick={handleAdd}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Добавить
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewTitle('');
              }}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full text-left text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded px-2 py-1 transition-colors"
        >
          + Добавить карточку
        </button>
      )}
    </div>
  );
}
