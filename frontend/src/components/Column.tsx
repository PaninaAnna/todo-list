import { useState, useRef, useEffect } from 'react';
import type { Column as ColumnType } from '../types';
import Card from './Card';

interface ColumnProps {
  column: ColumnType;
  onAddCard: (columnId: string, title: string) => void;
  onEditCard: (cardId: string, title: string, description: string) => void;
  onDeleteCard: (cardId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onUpdateCardTags: (cardId: string, tags: string[]) => void;
  allTags: string[];
}

export default function Column({ column, onAddCard, onEditCard, onDeleteCard, onRenameColumn, onDeleteColumn, onUpdateCardTags, allTags }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddCard(column.id, newTitle);
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onRenameColumn(column.id, editTitle);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4 flex flex-col max-h-full min-h-0 w-full">
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') {
                setEditTitle(column.title);
                setIsEditingTitle(false);
              }
            }}
            className="font-semibold text-gray-700 border-b border-blue-400 outline-none bg-transparent w-full"
          />
        ) : (
          <h3
            className="font-semibold text-gray-700 cursor-pointer hover:text-blue-600 truncate"
            onClick={() => {
              setEditTitle(column.title);
              setIsEditingTitle(true);
            }}
          >
            {column.title}
          </h3>
        )}
        <button
          onClick={() => onDeleteColumn(column.id)}
          className="text-gray-400 hover:text-red-500 text-sm flex-shrink-0 ml-2"
          title="Удалить колонку"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 min-h-0 mb-3">
        {column.cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
            onUpdateTags={onUpdateCardTags}
            allTags={allTags}
          />
        ))}
      </div>

      {isAdding ? (
        <div className="space-y-2 flex-shrink-0">
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
          className="w-full text-left text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded px-2 py-1 transition-colors flex-shrink-0"
        >
          + Добавить карточку
        </button>
      )}
    </div>
  );
}
