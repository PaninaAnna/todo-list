import { useState, useRef, useEffect } from 'react';

interface TagInputProps {
  tags: string[];
  allTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export default function TagInput({ tags, allTags, onAddTag, onRemoveTag }: TagInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = allTags.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(tag)
  );

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onAddTag(trimmed);
    }
    setInputValue('');
    setShowSuggestions(false);
    setIsAdding(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      } else {
        setIsAdding(false);
        setShowSuggestions(false);
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      } else {
        setIsAdding(false);
      }
    }
    if (e.key === 'Escape') {
      setInputValue('');
      setIsAdding(false);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (inputValue.length > 0 && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, filteredSuggestions.length]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex flex-wrap gap-1 items-center">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1"
          >
            {tag}
            <button
              onClick={() => onRemoveTag(tag)}
              className="text-blue-400 hover:text-blue-700"
            >
              ×
            </button>
          </span>
        ))}
        {isAdding ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="тег..."
            className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-0.5 outline-none focus:border-blue-300 w-20"
          />
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded px-1.5 py-0.5 transition-colors"
          >
            + тег
          </button>
        )}
      </div>
      {showSuggestions && (
        <div className="absolute top-full left-0 bg-white border border-gray-200 rounded shadow-lg z-10 mt-1">
          {filteredSuggestions.map((tag) => (
            <button
              key={tag}
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddTag(tag);
              }}
              className="block w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
