import { Draggable } from '@hello-pangea/dnd';
import type { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  index: number;
}

export default function Card({ card, index }: CardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow p-3 cursor-grab hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
          }`}
        >
          <h4 className="font-medium text-gray-800">{card.title}</h4>
          {card.description && (
            <p className="text-sm text-gray-500 mt-1">{card.description}</p>
          )}
        </div>
      )}
    </Draggable>
  );
}
