import { Router } from 'express';
import { requireAuth } from './auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const db = req.app.get('db');
  db.all('SELECT * FROM expenses WHERE userId = ? ORDER BY datetime(createdAt) DESC', 
    [req.userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(rows);
    });
});

router.post('/', (req, res) => {
  const db = req.app.get('db');
  const { title, category, amount } = req.body;
  if (!title || !category || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Invalid fields' });
  }
  
  db.run('INSERT INTO expenses (userId, title, category, amount) VALUES (?, ?, ?, ?)', 
    [req.userId, title, category, amount], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      
      db.get('SELECT * FROM expenses WHERE id = ?', [this.lastID], (err, created) => {
        if (err) {
          return res.status(500).json({ error: 'Server error' });
        }
        res.status(201).json(created);
      });
    });
});

router.put('/:id', (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const { title, category, amount } = req.body;
  
  db.get('SELECT * FROM expenses WHERE id = ? AND userId = ?', [id, req.userId], (err, current) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (!current) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const newTitle = title ?? current.title;
    const newCategory = category ?? current.category;
    const newAmount = amount ?? current.amount;
    
    db.run('UPDATE expenses SET title = ?, category = ?, amount = ? WHERE id = ?', 
      [newTitle, newCategory, newAmount, id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Server error' });
        }
        
        db.get('SELECT * FROM expenses WHERE id = ?', [id], (err, updated) => {
          if (err) {
            return res.status(500).json({ error: 'Server error' });
          }
          res.json(updated);
        });
      });
  });
});

router.delete('/:id', (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  
  db.run('DELETE FROM expenses WHERE id = ? AND userId = ?', [id, req.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(204).end();
  });
});

router.get('/summary/by-category', (req, res) => {
  const db = req.app.get('db');
  db.all(
    'SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses WHERE userId = ? GROUP BY category ORDER BY total DESC',
    [req.userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(rows);
    });
});

export default router;


