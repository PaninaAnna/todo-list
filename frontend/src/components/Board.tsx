import ProfileModal from './ProfileModal';
import { useState, useRef, useMemo, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Board as BoardType, Checklist } from '../types';
import Column from './Column';
import ArchiveModal from './ArchiveModal';

interface BoardProps {
  board: BoardType;
  onUpdateBoard: (board: BoardType) => void;
  sidebarOpen: boolean; 
  onToggleSidebar: () => void;
  user: any;
  onShowProfile: () => void;
  showProfile: boolean;
  onCloseProfile: () => void;
  onLogout: () => void;
}

export default function Board({ board, onUpdateBoard, sidebarOpen, onToggleSidebar, user, onShowProfile, showProfile, onCloseProfile, onLogout }: BoardProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingColumns, setIsEditingColumns] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isOverScrollableChild = (e.target as HTMLElement).closest('.overflow-y-auto');
    if (isOverScrollableChild) return;

    container.scrollLeft += e.deltaY;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const newBoard = { ...board };
    const columns = [...newBoard.columns];

    const sourceCol = columns.find((col) => col.id === source.droppableId);
    const destCol = columns.find((col) => col.id === destination.droppableId);

    if (!sourceCol || !destCol) return;

    const [movedCard] = sourceCol.cards.splice(source.index, 1);
    destCol.cards.splice(destination.index, 0, movedCard);

    onUpdateBoard({ ...newBoard, columns });
  };

  const addCard = (columnId: string, title: string) => {
    if (!title.trim()) return;

    const newCard = {
      id: `card-${Date.now()}`,
      title: title.trim(),
      description: '',
      tags: [],
      checklists: [],
    };

    const newBoard = { ...board };
    const columns = [...newBoard.columns];
    const column = columns.find((col) => col.id === columnId);

    if (column) {
      column.cards.push(newCard);
    }

    onUpdateBoard({ ...newBoard, columns });
  };

  const editCard = (cardId: string, title: string, description: string) => {
    const newBoard = { ...board };
    const columns = [...newBoard.columns];

    for (const col of columns) {
      const card = col.cards.find((c) => c.id === cardId);
      if (card) {
        card.title = title;
        card.description = description;
        break;
      }
    }

    onUpdateBoard({ ...newBoard, columns });
  };

  const deleteCard = (cardId: string) => {
    const newBoard = { ...board };
    const columns = [...newBoard.columns];

    for (const col of columns) {
      const cardIndex = col.cards.findIndex((c) => c.id === cardId);
      if (cardIndex !== -1) {
        const [removedCard] = col.cards.splice(cardIndex, 1);
        newBoard.archivedCards = [
          ...newBoard.archivedCards,
          {
            id: removedCard.id,
            title: removedCard.title,
            description: removedCard.description,
            tags: removedCard.tags,
            checklists: removedCard.checklists,
            columnId: col.id,
            columnTitle: col.title,
          },
        ];
        break;
      }
    }

    onUpdateBoard({ ...newBoard, columns });
  };

  const renameColumn = (columnId: string, title: string) => {
    const newBoard = { ...board };
    const columns = [...newBoard.columns];
    const column = columns.find((col) => col.id === columnId);

    if (column) {
      column.title = title;
    }

    onUpdateBoard({ ...newBoard, columns });
  };

  const deleteColumn = (columnId: string) => {
    const newBoard = { ...board };
    const columnIndex = newBoard.columns.findIndex((col) => col.id === columnId);

    if (columnIndex !== -1) {
      const [removedColumn] = newBoard.columns.splice(columnIndex, 1);
      newBoard.archivedColumns = [...newBoard.archivedColumns, removedColumn];
    }

    onUpdateBoard(newBoard);
  };

  const moveColumn = (columnId: string, direction: 'left' | 'right') => {
    const newBoard = { ...board };
    const columns = [...newBoard.columns];
    const index = columns.findIndex((col) => col.id === columnId);

    if (direction === 'left' && index > 0) {
      [columns[index - 1], columns[index]] = [columns[index], columns[index - 1]];
    } else if (direction === 'right' && index < columns.length - 1) {
      [columns[index], columns[index + 1]] = [columns[index + 1], columns[index]];
    }

    onUpdateBoard({ ...newBoard, columns });
  };

  const addColumn = () => {
    const newColumn = {
      id: `col-${Date.now()}`,
      title: 'Новая колонка',
      cards: [],
    };

    const newBoard = { ...board };
    newBoard.columns = [...newBoard.columns, newColumn];

    onUpdateBoard(newBoard);
  };

  const updateCardTags = (cardId: string, tags: string[]) => {
    const newBoard = { ...board };
    const columns = [...newBoard.columns];

    for (const col of columns) {
      const card = col.cards.find((c) => c.id === cardId);
      if (card) {
        card.tags = tags;
        break;
      }
    }

    onUpdateBoard({ ...newBoard, columns });
  };

  const updateCardChecklists = (cardId: string, checklists: Checklist[]) => {
    const newBoard = { ...board };
    const columns = [...newBoard.columns];

    for (const col of columns) {
      const card = col.cards.find((c) => c.id === cardId);
      if (card) {
        card.checklists = checklists;
        break;
      }
    }

    onUpdateBoard({ ...newBoard, columns });
  };

  const restoreCard = (cardId: string) => {
    const newBoard = { ...board };
    const cardIndex = newBoard.archivedCards.findIndex((c) => c.id === cardId);

    if (cardIndex === -1) return;

    const [restoredCard] = newBoard.archivedCards.splice(cardIndex, 1);

    let targetColumn = newBoard.columns.find((col) => col.id === restoredCard.columnId);
    if (!targetColumn) {
      targetColumn = newBoard.columns[0];
    }

    if (targetColumn) {
      targetColumn.cards.push({
        id: restoredCard.id,
        title: restoredCard.title,
        description: restoredCard.description,
        tags: restoredCard.tags,
        checklists: restoredCard.checklists,
      });
    }

    onUpdateBoard(newBoard);
  };

  const deleteCardForever = (cardId: string) => {
    const newBoard = { ...board };
    newBoard.archivedCards = newBoard.archivedCards.filter((c) => c.id !== cardId);
    onUpdateBoard(newBoard);
  };

  const restoreColumn = (columnId: string) => {
    const newBoard = { ...board };
    const colIndex = newBoard.archivedColumns.findIndex((c) => c.id === columnId);

    if (colIndex === -1) return;

    const [restoredColumn] = newBoard.archivedColumns.splice(colIndex, 1);
    newBoard.columns.push(restoredColumn);

    onUpdateBoard(newBoard);
  };

  const deleteColumnForever = (columnId: string) => {
    const newBoard = { ...board };
    newBoard.archivedColumns = newBoard.archivedColumns.filter((c) => c.id !== columnId);
    onUpdateBoard(newBoard);
  };

  const allTags = useMemo(() => {
    return board.columns
      .flatMap((col) => col.cards.flatMap((card) => card.tags))
      .filter((tag, index, arr) => arr.indexOf(tag) === index);
  }, [board.columns]);

  useEffect(() => {
    if (activeFilters.length === 0) return;
    setActiveFilters((prev) =>
      prev.filter((tag) => allTags.includes(tag))
    );
  }, [allTags]);

  const toggleFilter = (tag: string) => {
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  const searchFilterCard = (card: { title: string; description: string; tags: string[] }) => {
    const matchesTags = activeFilters.length === 0 || activeFilters.every((tag) => card.tags.includes(tag));
    if (!matchesTags) return false;

    if (searchQuery.trim() === '') return true;

    const query = searchQuery.toLowerCase();
    return (
      card.title.toLowerCase().includes(query) ||
      card.description.toLowerCase().includes(query)
    );
  };

  const filteredBoard: BoardType = useMemo(() => {
    return {
      ...board,
      columns: board.columns.map((col) => ({
        ...col,
        cards: col.cards.filter(searchFilterCard),
      })),
    };
  }, [board, activeFilters, searchQuery]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              title="Показать доски"
            >
              ☰
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-800 flex-shrink-0">{board.title}</h2>
          <div className="flex-1 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по карточкам..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setIsEditingColumns(!isEditingColumns)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors border ${
                isEditingColumns
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
              }`}
              title="Редактировать колонки"
            >
              {isEditingColumns ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowArchive(true)}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
              title="Архив"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={onShowProfile}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                title="Профиль"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </button>
              {showProfile && (
                <ProfileModal user={user} onClose={onCloseProfile} onLogout={onLogout} />
              )}
            </div>
          </div>
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {allTags.map((tag) => {
              const isActive = activeFilters.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleFilter(tag)}
                  className={`text-xs px-2 py-0.5 rounded transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
            {activeFilters.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Сбросить
              </button>
            )}
          </div>
        )}
      </div>
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex-1 overflow-x-auto overflow-y-hidden p-6 pt-4"
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full">
            {filteredBoard.columns.map((column, index) => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-shrink-0 flex-1 min-w-[288px]"
                  >
                    <Column
                      column={column}
                      index={index}
                      totalColumns={filteredBoard.columns.length}
                      onAddCard={addCard}
                      onEditCard={editCard}
                      onDeleteCard={deleteCard}
                      onRenameColumn={renameColumn}
                      onDeleteColumn={deleteColumn}
                      onMoveColumn={moveColumn}
                      onUpdateCardTags={updateCardTags}
                      onUpdateCardChecklists={updateCardChecklists}
                      allTags={allTags}
                      activeFilters={activeFilters}
                      onToggleFilter={toggleFilter}
                      isEditing={isEditingColumns}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
            {isEditingColumns && (
              <button
                onClick={addColumn}
                className="bg-gray-100 bg-opacity-60 rounded-lg p-4 flex-shrink-0 h-fit text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center"
                style={{ width: '288px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Добавить колонку
              </button>
            )}
          </div>
        </DragDropContext>
      </div>
      {showArchive && (
        <ArchiveModal
          archivedCards={board.archivedCards}
          archivedColumns={board.archivedColumns}
          onRestoreCard={restoreCard}
          onDeleteCardForever={deleteCardForever}
          onRestoreColumn={restoreColumn}
          onDeleteColumnForever={deleteColumnForever}
          onClose={() => setShowArchive(false)}
        />
      )}
    </div>
  );
}
