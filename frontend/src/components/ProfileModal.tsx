import { useState } from 'react';
import { updateProfile } from '../api/auth';

interface ProfileModalProps {
  user: { id: string; email: string; name: string };
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileModal({ user, onClose, onLogout }: ProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (name.trim() && name.trim() !== user.name) {
      try {
        await updateProfile(name.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    }
  };

  return (
    <div className="absolute top-10 right-0 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-64 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Профиль</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
          <p className="text-sm text-gray-700">{user.email}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Имя</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded outline-none focus:border-blue-400"
            />
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              OK
            </button>
          </div>
          {saved && (
            <p className="text-xs text-green-600 mt-1">Сохранено</p>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full text-left text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
