import { useState, useRef, useMemo, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Board as BoardType } from '../types';
import Column from './Column';

interface BoardProps {
  board: BoardType;
}

export default function Board({ board: initialBoard }: BoardProps) {
  const [board, setBoard] = useState<BoardType>(initialBoard);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
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

    setBoard({ ...newBoard, columns });
  };

  const addCard = (columnId: string, title: string) => {
    if (!title.trim()) return;

    const newCard = {
      id: `card-${Date.now()}`,
      title: title.trim(),
      description: '',
      tags: [],
    };

    const newBoard = { ...board };
    const columns = [...newBoard.columns];
    const column = columns.find((col) => col.id === columnId);

    if (column) {
      column.cards.push(newCard);
    }

    setBoard({ ...newBoard, columns });
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

    setBoard({ ...newBoard, columns });
  };

  const deleteCard = (cardId: string) => {
    const newBoard = { ...board };
    const columns = [...newBoard.columns];

    for (const col of columns) {
      col.cards = col.cards.filter((c) => c.id !== cardId);
    }

    setBoard({ ...newBoard, columns });
  };

  const renameColumn = (columnId: string, title: string) => {
    const newBoard = { ...board };
    const columns = [...newBoard.columns];
    const column = columns.find((col) => col.id === columnId);

    if (column) {
      column.title = title;
    }

    setBoard({ ...newBoard, columns });
  };

  const deleteColumn = (columnId: string) => {
    const newBoard = { ...board };
    newBoard.columns = newBoard.columns.filter((col) => col.id !== columnId);

    setBoard(newBoard);
  };

  const addColumn = () => {
    const newColumn = {
      id: `col-${Date.now()}`,
      title: 'Новая колонка',
      cards: [],
    };

    const newBoard = { ...board };
    newBoard.columns = [...newBoard.columns, newColumn];

    setBoard(newBoard);
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

    setBoard({ ...newBoard, columns });
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
    <div className="h-screen flex flex-col">
      <div className="p-6 pb-0 flex-shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold text-gray-800">{board.title}</h2>
          <button
            onClick={addColumn}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            + Добавить колонку
          </button>
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
            {filteredBoard.columns.map((column) => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-shrink-0 flex-1 min-w-[288px]"
                  >
                    <Column
                      column={column}
                      onAddCard={addCard}
                      onEditCard={editCard}
                      onDeleteCard={deleteCard}
                      onRenameColumn={renameColumn}
                      onDeleteColumn={deleteColumn}
                      onUpdateCardTags={updateCardTags}
                      allTags={allTags}
                      activeFilters={activeFilters}
                      onToggleFilter={toggleFilter}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
