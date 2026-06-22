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
}

export default function Board({ board, onUpdateBoard, sidebarOpen, onToggleSidebar }: BoardProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
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

  const filterCard = (card: { tags: string[] }) => {
    if (activeFilters.length === 0) return true;
    return activeFilters.every((tag) => card.tags.includes(tag));
  };

  const filteredBoard: BoardType = useMemo(() => {
    return {
      ...board,
      columns: board.columns.map((col) => ({
        ...col,
        cards: col.cards.filter(filterCard),
      })),
    };
  }, [board, activeFilters]);

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
          <h2 className="text-2xl font-bold text-gray-800">{board.title}</h2>
          <div className="ml-auto">
            <h3 className="text-xs font-medium text-gray-400 uppercase mb-1.5">Колонки</h3>
            <div className="flex gap-1.5">
              <button
                onClick={addColumn}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors border border-gray-200"
              >
                + Добавить
              </button>
              <button
                onClick={() => setIsEditingColumns(!isEditingColumns)}
                className={`px-3 py-1.5 text-sm rounded transition-colors border ${
                  isEditingColumns
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {isEditingColumns ? '✓ Готово' : '✎ Изменить'}
              </button>
              <button
                onClick={() => setShowArchive(true)}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors border border-gray-200"
              >
                Архив
              </button>
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
