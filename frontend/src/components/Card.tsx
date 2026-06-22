import { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  index: number;
  onEdit: (cardId: string, title: string, description: string) => void;
  onDelete: (cardId: string) => void;
}

export default function Card({ card, index, onEdit, onDelete }: CardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description);
  const [originalTitle, setOriginalTitle] = useState(card.title);
  const [originalDescription, setOriginalDescription] = useState(card.description);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descInputRef.current) {
      descInputRef.current.focus();
    }
  }, [isEditingDescription]);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onEdit(card.id, editTitle, card.description);
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setEditTitle(originalTitle);
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    onEdit(card.id, card.title, editDescription);
    setIsEditingDescription(false);
  };

  const handleCancelDescription = () => {
    setEditDescription(originalDescription);
    setIsEditingDescription(false);
  };

  useEffect(() => {
    if (!isEditingTitle) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleCancelTitle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditingTitle, originalTitle]);

  useEffect(() => {
    if (!isEditingDescription) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleCancelDescription();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditingDescription, originalDescription]);

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelTitle();
                  }}
                  className="w-full font-medium text-gray-800 border-b border-blue-400 outline-none pb-0.5"
                />
              ) : (
                <h4
                  className="font-medium text-gray-800 cursor-pointer hover:text-blue-600"
                  onClick={() => {
                    setOriginalTitle(card.title);
                    setEditTitle(card.title);
                    setIsEditingTitle(true);
                  }}
                >
                  {card.title || 'Без названия'}
                </h4>
              )}

              {isEditingDescription ? (
                <textarea
                  ref={descInputRef}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onBlur={handleSaveDescription}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') handleCancelDescription();
                  }}
                  className="w-full text-sm text-gray-500 border border-gray-300 rounded px-2 py-1 mt-1 resize-none"
                  rows={2}
                  placeholder="Добавить описание..."
                />
              ) : (
                <p
                  className={`text-sm mt-1 cursor-pointer hover:bg-gray-50 rounded px-1 -ml-1 ${
                    card.description ? 'text-gray-500' : 'text-gray-300 italic'
                  }`}
                  onClick={() => {
                    setOriginalDescription(card.description);
                    setEditDescription(card.description);
                    setIsEditingDescription(true);
                  }}
                >
                  {card.description || 'Добавить описание...'}
                </p>
              )}

              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {card.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.id);
              }}
              className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0 text-sm"
              title="Удалить"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
