import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from './db';
import authRoutes from './routes/auth';
import boardRoutes from './routes/boards';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function seed() {
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (existingUsers.count > 0) return;

  const ownerId = uuidv4();
  const editorId = uuidv4();
  const viewerId = uuidv4();
  const boardId = uuidv4();
  const col1Id = uuidv4();
  const col2Id = uuidv4();
  const col3Id = uuidv4();

  const hash = bcrypt.hashSync('Test123!', 10);

  db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)').run(ownerId, 'owner@test.com', hash, 'Владелец');
  db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)').run(editorId, 'editor@test.com', hash, 'Редактор');
  db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)').run(viewerId, 'viewer@test.com', hash, 'Читатель');

  db.prepare('INSERT INTO boards (id, title, ownerId) VALUES (?, ?, ?)').run(boardId, 'Тестовая доска', ownerId);

  db.prepare('INSERT INTO board_members (id, userId, boardId, role) VALUES (?, ?, ?, ?)').run(uuidv4(), editorId, boardId, 'editor');
  db.prepare('INSERT INTO board_members (id, userId, boardId, role) VALUES (?, ?, ?, ?)').run(uuidv4(), viewerId, boardId, 'viewer');

  db.prepare('INSERT INTO columns (id, title, "order", boardId) VALUES (?, ?, 0, ?)').run(col1Id, 'To Do', boardId);
  db.prepare('INSERT INTO columns (id, title, "order", boardId) VALUES (?, ?, 1, ?)').run(col2Id, 'In Progress', boardId);
  db.prepare('INSERT INTO columns (id, title, "order", boardId) VALUES (?, ?, 2, ?)').run(col3Id, 'Done', boardId);

  db.prepare('INSERT INTO cards (id, title, description, tags, "order", columnId) VALUES (?, ?, ?, ?, 0, ?)').run(uuidv4(), 'Настроить проект', 'Vite + React + Tailwind', '["фронтенд"]', col1Id);
  db.prepare('INSERT INTO cards (id, title, description, tags, "order", columnId) VALUES (?, ?, ?, ?, 1, ?)').run(uuidv4(), 'Сделать вёрстку', '', '["дизайн"]', col1Id);
  db.prepare('INSERT INTO cards (id, title, description, tags, "order", columnId) VALUES (?, ?, ?, ?, 0, ?)').run(uuidv4(), 'Drag & drop', 'Перетаскивание карточек', '["фронтенд", "логика"]', col2Id);
  db.prepare('INSERT INTO cards (id, title, description, tags, "order", columnId) VALUES (?, ?, ?, ?, 0, ?)').run(uuidv4(), 'Репозиторий', 'Создан и настроен', '["инфра"]', col3Id);

  console.log('Seed completed');
}

seed();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
