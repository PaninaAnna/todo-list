import { useState } from 'react';
import Board from './components/Board';
import BoardSettingsModal from './components/BoardSettingsModal';
import { mockBoards } from './mockData';
import type { Board as BoardType } from './types';

export default function App() {
  const [boards, setBoards] = useState<BoardType[]>(mockBoards);
  const [activeBoardId, setActiveBoardId] = useState<string>(boards[0]?.id || '');
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsBoardId, setSettingsBoardId] = useState<string | null>(null);

  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  const updateBoard = (updatedBoard: BoardType) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b))
    );
  };

  const addBoard = () => {
    if (!newBoardTitle.trim()) return;

    const newBoard: BoardType = {
      id: `board-${Date.now()}`,
      title: newBoardTitle.trim(),
      columns: [],
      ownerId: 'user-1',
      memberIds: [],
      archivedCards: [],
      archivedColumns: [],
    };

    setBoards((prev) => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
    setNewBoardTitle('');
    setIsAddingBoard(false);
  };

  const deleteBoard = (boardId: string) => {
    if (boards.length <= 1) return;
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    if (activeBoardId === boardId) {
      const remaining = boards.filter((b) => b.id !== boardId);
      setActiveBoardId(remaining[0]?.id || '');
    }
  };

  const renameBoard = (boardId: string, newTitle: string) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, title: newTitle } : b))
    );
  };

  const settingsBoard = settingsBoardId
    ? boards.find((b) => b.id === settingsBoardId) || null
    : null;

  if (!activeBoard && boards.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Нет ни одной доски</p>
          <button
            onClick={() => setIsAddingBoard(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Создать доску
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <div
        className={`bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden ${
          sidebarOpen ? 'w-64' : 'w-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase">Доски</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
            title="Скрыть панель"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {boards.map((board) => (
            <div
              key={board.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors relative group ${
                activeBoardId === board.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
              }`}
            >
              <div onClick={() => { setActiveBoardId(board.id); setSidebarOpen(false); }}>
                <h3 className="text-sm font-medium text-gray-800 truncate pr-6">{board.title}</h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsBoardId(board.id);
                }}
                className="absolute top-1/2 -translate-y-1/2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Настройки доски"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-100">
          {isAddingBoard ? (
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              onBlur={() => {
                if (!newBoardTitle.trim()) setIsAddingBoard(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addBoard();
                if (e.key === 'Escape') {
                  setNewBoardTitle('');
                  setIsAddingBoard(false);
                }
              }}
              placeholder="Название доски"
              className="w-full px-2 py-1.5 text-sm border border-blue-400 rounded outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsAddingBoard(true)}
              className="w-full text-left text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded px-2 py-1.5 transition-colors"
            >
              + Новая доска
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {activeBoard && (
          <Board
            board={activeBoard}
            onUpdateBoard={updateBoard}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        )}
      </div>
      {settingsBoard && (
        <BoardSettingsModal
          board={settingsBoard}
          onRenameBoard={renameBoard}
          onDeleteBoard={deleteBoard}
          onClose={() => setSettingsBoardId(null)}
        />
      )}
    </div>
  );
}
