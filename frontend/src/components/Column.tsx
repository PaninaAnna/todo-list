import type { Column as ColumnType } from '../types';
import Card from './Card';

interface ColumnProps {
  column: ColumnType;
}

export default function Column({ column }: ColumnProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 w-72 flex-shrink-0">
      <h3 className="font-semibold text-gray-700 mb-3">{column.title}</h3>
      <div className="space-y-2">
        {column.cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
