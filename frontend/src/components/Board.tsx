import { useState, useRef } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Board as BoardType } from '../types';
import Column from './Column';

interface BoardProps {
  board: BoardType;
}

export default function Board({ board: initialBoard }: BoardProps) {
  const [board, setBoard] = useState<BoardType>(initialBoard);
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

  const allTags = board.columns
    .flatMap((col) => col.cards.flatMap((card) => card.tags))
    .filter((tag, index, arr) => arr.indexOf(tag) === index);

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 pb-0">
        <h2 className="text-2xl font-bold text-gray-800">{board.title}</h2>
      </div>
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex-1 overflow-x-auto overflow-y-hidden p-6 pt-4"
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full">
            {board.columns.map((column) => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
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
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
            <button
              onClick={addColumn}
              className="bg-gray-200 bg-opacity-50 rounded-lg p-4 w-72 flex-shrink-0 h-fit text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition-colors text-left"
            >
              + Добавить колонку
            </button>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
