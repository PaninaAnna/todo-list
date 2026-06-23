import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db from '../db';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

function parseBoard(board: any) {
  const columns = db.prepare('SELECT * FROM columns WHERE boardId = ? ORDER BY "order"').all(board.id) as any[];
  const parsedColumns = columns.map((col) => {
    const cards = db.prepare('SELECT * FROM cards WHERE columnId = ? ORDER BY "order"').all(col.id) as any[];
    const parsedCards = cards.map((card) => {
      const checklists = db.prepare('SELECT * FROM checklists WHERE cardId = ?').all(card.id) as any[];
      const parsedChecklists = checklists.map((cl) => {
        const items = db.prepare('SELECT * FROM checklist_items WHERE checklistId = ?').all(cl.id) as any[];
        return { ...cl, items: items.map((i) => ({ ...i, completed: !!i.completed })) };
      });
      return { ...card, tags: JSON.parse(card.tags), checklists: parsedChecklists };
    });
    return { ...col, cards: parsedCards };
  });

  const archivedCards = (db.prepare('SELECT * FROM archived_cards WHERE boardId = ?').all(board.id) as any[]).map(
    (c) => ({ ...c, tags: JSON.parse(c.tags), checklists: JSON.parse(c.checklists) })
  );

  const archivedColumns = (db.prepare('SELECT * FROM archived_columns WHERE boardId = ?').all(board.id) as any[]).map(
    (c) => ({ ...c, cards: JSON.parse(c.cards) })
  );

  return {
    ...board,
    columns: parsedColumns,
    archivedCards,
    archivedColumns,
  };
}

router.post('/seed', async (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM checklist_items').run();
    db.prepare('DELETE FROM checklists').run();
    db.prepare('DELETE FROM cards').run();
    db.prepare('DELETE FROM columns').run();
    db.prepare('DELETE FROM archived_cards').run();
    db.prepare('DELETE FROM archived_columns').run();
    db.prepare('DELETE FROM boards').run();
    db.prepare('DELETE FROM users').run();

    const userId = uuidv4();
    const boardId = uuidv4();
    const hash = bcrypt.hashSync('Test123!', 10);

    db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)').run(userId, 'test@test.com', hash, 'Тестовый пользователь');

    db.prepare('INSERT INTO boards (id, title, ownerId) VALUES (?, ?, ?)').run(boardId, 'Тестовая доска', userId);

    const col1Id = uuidv4();
    const col2Id = uuidv4();
    const col3Id = uuidv4();
    db.prepare('INSERT INTO columns (id, title, "order", boardId) VALUES (?, ?, 0, ?)').run(col1Id, 'To Do', boardId);
    db.prepare('INSERT INTO columns (id, title, "order", boardId) VALUES (?, ?, 1, ?)').run(col2Id, 'In Progress', boardId);
    db.prepare('INSERT INTO columns (id, title, "order", boardId) VALUES (?, ?, 2, ?)').run(col3Id, 'Done', boardId);

    db.prepare('INSERT INTO cards (id, title, description, tags, "order", columnId) VALUES (?, ?, ?, ?, 0, ?)').run(uuidv4(), 'Настроить проект', 'Vite + React + Tailwind', '["фронтенд"]', col1Id);
    db.prepare('INSERT INTO cards (id, title, description, tags, "order", columnId) VALUES (?, ?, ?, ?, 1, ?)').run(uuidv4(), 'Сделать вёрстку', '', '["дизайн"]', col1Id);
    db.prepare('INSERT INTO cards (id, title, description, tags, "order", columnId) VALUES (?, ?, ?, ?, 0, ?)').run(uuidv4(), 'Drag & drop', 'Перетаскивание карточек', '["фронтенд", "логика"]', col2Id);
    db.prepare('INSERT INTO cards (id, title, description, tags, "order", columnId) VALUES (?, ?, ?, ?, 0, ?)').run(uuidv4(), 'Репозиторий', 'Создан и настроен', '["инфра"]', col3Id);

    res.json({ success: true, message: 'Seed completed' });
  } catch (error: any) {
    console.error('Seed error:', error.message || error);
    res.status(500).json({ error: 'Seed failed' });
  }
});

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const boards = db.prepare('SELECT * FROM boards WHERE ownerId = ?').all(req.userId) as any[];
    res.json(boards.map(parseBoard));
  } catch (error: any) {
    console.error('Get boards error:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const id = uuidv4();
    const columnId = uuidv4();
    
    const insertBoard = db.transaction(() => {
      db.prepare('INSERT INTO boards (id, title, ownerId) VALUES (?, ?, ?)').run(id, title, req.userId);
      db.prepare('INSERT INTO columns (id, title, "order", boardId) VALUES (?, ?, 0, ?)').run(columnId, 'To Do', id);
    });
    
    insertBoard();
    
    const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(id);
    res.json(parseBoard(board));
  } catch (error: any) {
    console.error('Create board error:', error.message || error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, columns, archivedCards, archivedColumns, updatedAt } = req.body;

    const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(id) as any;
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (board.ownerId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (updatedAt && board.updatedAt !== updatedAt) {
      res.status(409).json({ error: 'Board was modified by another user. Please refresh.' });
      return;
    }

    const updateBoard = db.transaction(() => {
      if (title) {
        db.prepare(`UPDATE boards SET title = ?, updatedAt = datetime('now') WHERE id = ?`).run(title, id);
      } else {
        db.prepare(`UPDATE boards SET updatedAt = datetime('now') WHERE id = ?`).run(id);
      }

      if (columns) {
        db.prepare('DELETE FROM columns WHERE boardId = ?').run(id);
        for (let i = 0; i < columns.length; i++) {
          const col = columns[i];
          db.prepare('INSERT INTO columns (id, title, "order", boardId) VALUES (?, ?, ?, ?)').run(col.id, col.title, i, id);

          for (let j = 0; j < (col.cards || []).length; j++) {
            const card = col.cards[j];
            db.prepare('INSERT INTO cards (id, title, description, tags, "order", columnId) VALUES (?, ?, ?, ?, ?, ?)').run(card.id, card.title, card.description || '', JSON.stringify(card.tags || []), j, col.id);

            for (const checklist of card.checklists || []) {
              db.prepare('INSERT INTO checklists (id, title, cardId) VALUES (?, ?, ?)').run(checklist.id, checklist.title, card.id);

              for (const item of checklist.items || []) {
                db.prepare('INSERT INTO checklist_items (id, text, completed, checklistId) VALUES (?, ?, ?, ?)').run(item.id, item.text, item.completed ? 1 : 0, checklist.id);
              }
            }
          }
        }
      }

      if (archivedCards !== undefined) {
        db.prepare('DELETE FROM archived_cards WHERE boardId = ?').run(id);
        for (const card of archivedCards) {
          db.prepare('INSERT INTO archived_cards (id, title, description, tags, checklists, columnId, columnTitle, boardId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(card.id, card.title, card.description || '', JSON.stringify(card.tags || []), JSON.stringify(card.checklists || []), card.columnId, card.columnTitle, id);
        }
      }

      if (archivedColumns !== undefined) {
        db.prepare('DELETE FROM archived_columns WHERE boardId = ?').run(id);
        for (const col of archivedColumns) {
          db.prepare('INSERT INTO archived_columns (id, title, cards, boardId) VALUES (?, ?, ?, ?)').run(col.id, col.title, JSON.stringify(col.cards || []), id);
        }
      }
    });

    updateBoard();
    
    const updatedBoard = db.prepare('SELECT * FROM boards WHERE id = ?').get(id);
    res.json(parseBoard(updatedBoard));
  } catch (error: any) {
    console.error('Update board error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to update board' });
  }
});

router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(id) as any;
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (board.ownerId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    db.prepare('DELETE FROM boards WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete board error:', error.message || error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

export default router;
