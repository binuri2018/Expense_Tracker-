import { Router } from 'express';
import { requireAuth } from './auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const db = req.app.get('db');
  const rows = db
    .prepare('SELECT * FROM expenses WHERE userId = ? ORDER BY datetime(createdAt) DESC')
    .all(req.userId);
  res.json(rows);
});

router.post('/', (req, res) => {
  const db = req.app.get('db');
  const { title, category, amount } = req.body;
  if (!title || !category || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Invalid fields' });
  }
  const info = db
    .prepare('INSERT INTO expenses (userId, title, category, amount) VALUES (?, ?, ?, ?)')
    .run(req.userId, title, category, amount);
  const created = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const { title, category, amount } = req.body;
  const current = db
    .prepare('SELECT * FROM expenses WHERE id = ? AND userId = ?')
    .get(id, req.userId);
  if (!current) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE expenses SET title = ?, category = ?, amount = ? WHERE id = ?')
    .run(title ?? current.title, category ?? current.category, amount ?? current.amount, id);
  const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const info = db
    .prepare('DELETE FROM expenses WHERE id = ? AND userId = ?')
    .run(id, req.userId);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

router.get('/summary/by-category', (req, res) => {
  const db = req.app.get('db');
  const rows = db
    .prepare(
      'SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses WHERE userId = ? GROUP BY category ORDER BY total DESC'
    )
    .all(req.userId);
  res.json(rows);
});

export default router;


