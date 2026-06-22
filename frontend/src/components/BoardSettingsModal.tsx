import { useState } from 'react';
import type { Board } from '../types';

interface BoardSettingsModalProps {
  board: Board;
  onRenameBoard: (boardId: string, newTitle: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onClose: () => void;
}

export default function BoardSettingsModal({ board, onRenameBoard, onDeleteBoard, onClose }: BoardSettingsModalProps) {
  const [title, setTitle] = useState(board.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveTitle = () => {
    if (title.trim() && title.trim() !== board.title) {
      onRenameBoard(board.id, title.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDelete = () => {
    onDeleteBoard(board.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-800">Настройки доски</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Название доски</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-400"
              />
              <button
                onClick={handleSaveTitle}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Сохранить
              </button>
            </div>
            {saved && (
              <p className="text-xs text-green-600 mt-1">Название сохранено</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Доступ</label>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-400 text-center">
              Управление доступом появится позже
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            {showDeleteConfirm ? (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-sm text-red-700 mb-2">Удалить доску «{board.title}»? Это действие необратимо.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Удалить
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                Удалить доску
              </button>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
