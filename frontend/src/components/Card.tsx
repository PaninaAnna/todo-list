import { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Card as CardType, Checklist } from '../types';
import TagInput from './TagInput';

interface CardProps {
  card: CardType;
  index: number;
  onEdit: (cardId: string, title: string, description: string) => void;
  onDelete: (cardId: string) => void;
  onUpdateTags: (cardId: string, tags: string[]) => void;
  onUpdateChecklists: (cardId: string, checklists: Checklist[]) => void;
  allTags: string[];
  activeFilters: string[];
  onToggleFilter: (tag: string) => void;
  readonly: boolean;
}

export default function Card({ card, index, onEdit, onDelete, onUpdateTags, onUpdateChecklists, allTags, activeFilters, onToggleFilter, readonly }: CardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description);
  const [originalTitle, setOriginalTitle] = useState(card.title);
  const [originalDescription, setOriginalDescription] = useState(card.description);
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [editChecklistTitle, setEditChecklistTitle] = useState('');
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

  const handleAddTag = (tag: string) => {
    if (!card.tags.includes(tag)) {
      onUpdateTags(card.id, [...card.tags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    onUpdateTags(card.id, card.tags.filter((t) => t !== tag));
  };

  const handleAddChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    const newChecklist: Checklist = {
      id: `cl-${Date.now()}`,
      title: newChecklistTitle.trim(),
      items: [],
    };
    onUpdateChecklists(card.id, [...card.checklists, newChecklist]);
    setNewChecklistTitle('');
    setIsAddingChecklist(false);
  };

  const handleStartEditChecklist = (checklist: Checklist) => {
    setEditingChecklistId(checklist.id);
    setEditChecklistTitle(checklist.title);
  };

  const handleSaveChecklistTitle = () => {
    if (editChecklistTitle.trim() && editingChecklistId) {
      const updated = card.checklists.map((cl) =>
        cl.id === editingChecklistId ? { ...cl, title: editChecklistTitle.trim() } : cl
      );
      onUpdateChecklists(card.id, updated);
    }
    setEditingChecklistId(null);
  };

  const handleToggleChecklistItem = (checklistId: string, itemId: string) => {
    const updated = card.checklists.map((cl) => {
      if (cl.id !== checklistId) return cl;
      return {
        ...cl,
        items: cl.items.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
      };
    });
    onUpdateChecklists(card.id, updated);
  };

  const handleAddChecklistItem = (checklistId: string) => {
    const text = newItemTexts[checklistId];
    if (!text || !text.trim()) return;
    const newItem = { id: `item-${Date.now()}`, text: text.trim(), completed: false };
    const updated = card.checklists.map((cl) => {
      if (cl.id !== checklistId) return cl;
      return { ...cl, items: [...cl.items, newItem] };
    });
    onUpdateChecklists(card.id, updated);
    setNewItemTexts((prev) => ({ ...prev, [checklistId]: '' }));
  };

  const handleDeleteChecklistItem = (checklistId: string, itemId: string) => {
    const updated = card.checklists.map((cl) => {
      if (cl.id !== checklistId) return cl;
      return { ...cl, items: cl.items.filter((item) => item.id !== itemId) };
    });
    onUpdateChecklists(card.id, updated);
  };

  const handleDeleteChecklist = (checklistId: string) => {
    onUpdateChecklists(card.id, card.checklists.filter((cl) => cl.id !== checklistId));
  };

  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={readonly}>
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
              {isEditingTitle && !readonly ? (
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
                  className={`font-medium text-gray-800 break-all ${readonly ? '' : 'cursor-pointer hover:text-blue-600'}`}
                  onClick={() => {
                    if (!readonly) {
                      setOriginalTitle(card.title);
                      setEditTitle(card.title);
                      setIsEditingTitle(true);
                    }
                  }}
                >
                  {card.title || 'Без названия'}
                </h4>
              )}

              {isEditingDescription && !readonly ? (
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
                  className={`text-sm mt-1 break-all ${readonly ? '' : 'cursor-pointer hover:bg-gray-50 rounded px-1 -ml-1'} ${
                    card.description ? 'text-gray-500' : 'text-gray-300 italic'
                  }`}
                  onClick={() => {
                    if (!readonly) {
                      setOriginalDescription(card.description);
                      setEditDescription(card.description);
                      setIsEditingDescription(true);
                    }
                  }}
                >
                  {card.description || 'Добавить описание...'}
                </p>
              )}

              <div className="mt-2">
                <TagInput
                  tags={card.tags}
                  allTags={allTags}
                  onAddTag={readonly ? () => {} : handleAddTag}
                  onRemoveTag={readonly ? () => {} : handleRemoveTag}
                  activeFilters={activeFilters}
                  onToggleFilter={onToggleFilter}
                />
              </div>

              {card.checklists.length > 0 && (
                <div className="mt-3 space-y-2">
                  {card.checklists.map((checklist) => {
                    const completedCount = checklist.items.filter((i) => i.completed).length;
                    const totalCount = checklist.items.length;
                    return (
                      <div key={checklist.id} className="bg-gray-50 rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          {editingChecklistId === checklist.id && !readonly ? (
                            <input
                              type="text"
                              value={editChecklistTitle}
                              onChange={(e) => setEditChecklistTitle(e.target.value)}
                              onBlur={handleSaveChecklistTitle}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveChecklistTitle();
                                if (e.key === 'Escape') {
                                  setEditingChecklistId(null);
                                }
                              }}
                              className="text-xs font-medium text-gray-600 border-b border-blue-400 outline-none bg-transparent flex-1"
                              autoFocus
                            />
                          ) : (
                            <h5
                              className={`text-xs font-medium text-gray-600 break-all ${readonly ? '' : 'cursor-pointer hover:text-blue-600'}`}
                              onClick={() => {
                                if (!readonly) handleStartEditChecklist(checklist);
                              }}
                            >
                              {checklist.title}
                            </h5>
                          )}
                          {!readonly && (
                            <button
                              onClick={() => handleDeleteChecklist(checklist.id)}
                              className="text-gray-400 hover:text-red-500 text-xs flex-shrink-0 ml-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        {totalCount > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                            <div
                              className="bg-green-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${(completedCount / totalCount) * 100}%` }}
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          {checklist.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => handleToggleChecklistItem(checklist.id, item.id)}
                                disabled={readonly}
                                className="w-3.5 h-3.5 rounded border-gray-300 flex-shrink-0"
                              />
                              <span className={`text-xs flex-1 break-all ${item.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                {item.text}
                              </span>
                              {!readonly && (
                                <button
                                  onClick={() => handleDeleteChecklistItem(checklist.id, item.id)}
                                  className="text-gray-300 hover:text-red-400 text-xs opacity-0 hover:opacity-100 flex-shrink-0"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {!readonly && (
                          <div className="flex gap-1 mt-1.5">
                            <input
                              type="text"
                              value={newItemTexts[checklist.id] || ''}
                              onChange={(e) =>
                                setNewItemTexts((prev) => ({ ...prev, [checklist.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddChecklistItem(checklist.id);
                              }}
                              placeholder="Добавить пункт..."
                              className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:border-blue-300"
                            />
                            <button
                              onClick={() => handleAddChecklistItem(checklist.id)}
                              className="text-xs text-blue-500 hover:text-blue-700 flex-shrink-0"
                            >
                              Ок
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!readonly && (
                isAddingChecklist ? (
                  <div className="mt-2 bg-gray-50 rounded p-2">
                    <input
                      type="text"
                      value={newChecklistTitle}
                      onChange={(e) => setNewChecklistTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddChecklist();
                        if (e.key === 'Escape') {
                          setNewChecklistTitle('');
                          setIsAddingChecklist(false);
                        }
                      }}
                      onBlur={() => {
                        if (!newChecklistTitle.trim()) setIsAddingChecklist(false);
                      }}
                      placeholder="Название чек-листа..."
                      className="w-full text-xs border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:border-blue-300"
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingChecklist(true)}
                    className="mt-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded px-1.5 py-0.5 transition-colors"
                  >
                    + Чек-лист
                  </button>
                )
              )}
            </div>
            {!readonly && (
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
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
