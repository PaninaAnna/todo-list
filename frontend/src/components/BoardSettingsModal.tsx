import { useState, useEffect } from 'react';
import type { Board } from '../types';
import { api } from '../api/client';

interface Member {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: string;
}

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
  const [members, setMembers] = useState<Member[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('editor');
  const [memberError, setMemberError] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await api.get(`/boards/${board.id}/members`);
      setMembers(data.members || []);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const handleSaveTitle = () => {
    if (title.trim() && title.trim() !== board.title) {
      onRenameBoard(board.id, title.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleAddMember = async () => {
    if (!newEmail.trim()) return;
    setMemberError('');

    try {
      await api.post(`/boards/${board.id}/members`, { email: newEmail.trim(), role: newRole });
      setNewEmail('');
      loadMembers();
    } catch (error: any) {
      setMemberError(error.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.delete(`/boards/${board.id}/members/${userId}`);
      loadMembers();
    } catch (error: any) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleDelete = () => {
    onDeleteBoard(board.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
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
            <label className="block text-sm font-medium text-gray-600 mb-1">Участники</label>
            <div className="space-y-2 mb-3">
              {members.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">Нет участников</p>
              )}
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{member.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{member.role === 'editor' ? 'Редактор' : 'Читатель'}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="text-red-400 hover:text-red-600 text-sm px-2"
                    title="Удалить участника"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddMember();
                }}
                placeholder="Email пользователя"
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-400"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg outline-none"
              >
                <option value="editor">Редактор</option>
                <option value="viewer">Читатель</option>
              </select>
              <button
                onClick={handleAddMember}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Добавить
              </button>
            </div>
            {memberError && (
              <p className="text-xs text-red-500 mt-1">{memberError}</p>
            )}
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
