import type { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
}

export default function Card({ card }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-3 cursor-pointer hover:shadow-md transition-shadow">
      <h4 className="font-medium text-gray-800">{card.title}</h4>
      {card.description && (
        <p className="text-sm text-gray-500 mt-1">{card.description}</p>
      )}
    </div>
  );
}
