import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'data', 'todo.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    ownerId TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ownerId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS board_members (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    boardId TEXT NOT NULL,
    role TEXT DEFAULT 'viewer',
    UNIQUE(userId, boardId),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (boardId) REFERENCES boards(id)
  );

  CREATE TABLE IF NOT EXISTS columns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    boardId TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (boardId) REFERENCES boards(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    "order" INTEGER DEFAULT 0,
    dueDate TEXT,
    columnId TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (columnId) REFERENCES columns(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS checklists (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    cardId TEXT NOT NULL,
    FOREIGN KEY (cardId) REFERENCES cards(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS checklist_items (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    checklistId TEXT NOT NULL,
    FOREIGN KEY (checklistId) REFERENCES checklists(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS archived_cards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    checklists TEXT DEFAULT '[]',
    columnId TEXT NOT NULL,
    columnTitle TEXT NOT NULL,
    boardId TEXT NOT NULL,
    FOREIGN KEY (boardId) REFERENCES boards(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS archived_columns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    cards TEXT DEFAULT '[]',
    boardId TEXT NOT NULL,
    FOREIGN KEY (boardId) REFERENCES boards(id) ON DELETE CASCADE
  );
`);

export default db;
