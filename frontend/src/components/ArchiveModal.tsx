import { useState } from 'react';
import type { ArchivedCard, ArchivedColumn } from '../types';

interface ArchiveModalProps {
  archivedCards: ArchivedCard[];
  archivedColumns: ArchivedColumn[];
  onRestoreCard: (cardId: string) => void;
  onDeleteCardForever: (cardId: string) => void;
  onRestoreColumn: (columnId: string) => void;
  onDeleteColumnForever: (columnId: string) => void;
  onClose: () => void;
}

export default function ArchiveModal({ archivedCards, archivedColumns, onRestoreCard, onDeleteCardForever, onRestoreColumn, onDeleteColumnForever, onClose }: ArchiveModalProps) {
  const [tab, setTab] = useState<'cards' | 'columns'>('cards');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Архив</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setTab('cards')}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              tab === 'cards' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Карточки ({archivedCards.length})
          </button>
          <button
            onClick={() => setTab('columns')}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              tab === 'columns' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Колонки ({archivedColumns.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'cards' && (
            archivedCards.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Нет архивированных карточек</p>
            ) : (
              <div className="space-y-2">
                {archivedCards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{card.title}</p>
                      <p className="text-xs text-gray-400">Из колонки: {card.columnTitle}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => onRestoreCard(card.id)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Восстановить
                      </button>
                      <button
                        onClick={() => onDeleteCardForever(card.id)}
                        className="px-2 py-1 text-xs bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          {tab === 'columns' && (
            archivedColumns.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Нет архивированных колонок</p>
            ) : (
              <div className="space-y-2">
                {archivedColumns.map((col) => (
                  <div key={col.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{col.title}</p>
                      <p className="text-xs text-gray-400">{col.cards.length} карточек</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => onRestoreColumn(col.id)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Восстановить
                      </button>
                      <button
                        onClick={() => onDeleteColumnForever(col.id)}
                        className="px-2 py-1 text-xs bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
