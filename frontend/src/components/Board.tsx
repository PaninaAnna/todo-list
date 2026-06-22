import type { Board as BoardType } from '../types';
import Column from './Column';

interface BoardProps {
  board: BoardType;
}

export default function Board({ board }: BoardProps) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{board.title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
}
