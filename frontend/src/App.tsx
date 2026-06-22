import { useState, useEffect } from 'react';
import Board from './components/Board';
import BoardSettingsModal from './components/BoardSettingsModal';
import LoginPage from './components/LoginPage';
import { getMe } from './api/auth';
import { getBoards, createBoard, updateBoard, deleteBoard as apiDeleteBoard } from './api/boards';
import { clearToken } from './api/client';
import type { Board as BoardType } from './types';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState<BoardType[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsBoardId, setSettingsBoardId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((userData) => {
        setUser(userData);
        return getBoards();
      })
      .then((boardData) => {
        setBoards(boardData);
        if (boardData.length > 0) {
          setActiveBoardId(boardData[0].id);
        }
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    getMe()
      .then((userData) => {
        setUser(userData);
        return getBoards();
      })
      .then((boardData) => {
        setBoards(boardData);
        if (boardData.length > 0) {
          setActiveBoardId(boardData[0].id);
        }
      })
      .catch(() => {
        clearToken();
      });
  };

  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  const handleUpdateBoard = (updatedBoard: BoardType) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b))
    );

    updateBoard(updatedBoard.id, {
      title: updatedBoard.title,
      columns: updatedBoard.columns,
      archivedCards: updatedBoard.archivedCards,
      archivedColumns: updatedBoard.archivedColumns,
    }).catch(console.error);
  };

  const handleAddBoard = async () => {
    if (!newBoardTitle.trim()) return;

    try {
      const newBoard = await createBoard(newBoardTitle.trim());
      setBoards((prev) => [...prev, newBoard]);
      setActiveBoardId(newBoard.id);
      setNewBoardTitle('');
      setIsAddingBoard(false);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (boards.length <= 1) return;

    try {
      await apiDeleteBoard(boardId);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      if (activeBoardId === boardId) {
        const remaining = boards.filter((b) => b.id !== boardId);
        setActiveBoardId(remaining[0]?.id || '');
      }
    } catch (error) {
      console.error('Failed to delete board:', error);
    }
  };

  const handleRenameBoard = (boardId: string, newTitle: string) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, title: newTitle } : b))
    );

    updateBoard(boardId, { title: newTitle }).catch(console.error);
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setBoards([]);
    setActiveBoardId('');
  };

  const settingsBoard = settingsBoardId
    ? boards.find((b) => b.id === settingsBoardId) || null
    : null;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!activeBoard && boards.length === 0) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">Мои доски</h1>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
            Выйти
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Нет ни одной доски</p>
            <button
              onClick={async () => {
                try {
                  const newBoard = await createBoard('Новая доска');
                  setBoards([newBoard]);
                  setActiveBoardId(newBoard.id);
                } catch (error) {
                  console.error('Failed to create board:', error);
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Создать доску
            </button>
          </div>
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
              className={`p-3 rounded-lg transition-colors relative group flex items-center ${
                activeBoardId === board.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
              }`}
            >
              <div
                onClick={() => { setActiveBoardId(board.id); setSidebarOpen(false); }}
                className="flex-1 cursor-pointer min-w-0"
              >
                <h3 className="text-sm font-medium text-gray-800 truncate">{board.title}</h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsBoardId(board.id);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded flex-shrink-0 ml-1"
                title="Настройки доски"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
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
                if (e.key === 'Enter') handleAddBoard();
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
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded px-2 py-1.5 transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {activeBoard && (
          <Board
            board={activeBoard}
            onUpdateBoard={handleUpdateBoard}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        )}
      </div>
      {settingsBoard && (
        <BoardSettingsModal
          board={settingsBoard}
          onRenameBoard={handleRenameBoard}
          onDeleteBoard={handleDeleteBoard}
          onClose={() => setSettingsBoardId(null)}
        />
      )}
    </div>
  );
}
