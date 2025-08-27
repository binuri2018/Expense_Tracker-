import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';

router.post('/register', (req, res) => {
  const db = req.app.get('db');
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = bcrypt.hashSync(password, 10);
    const info = db
      .prepare('INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)')
      .run(username, email, passwordHash);
    const user = { id: info.lastInsertRowid, username, email };
    const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  const db = req.app.get('db');
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!userRow) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, userRow.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const user = { id: userRow.id, username: userRow.username, email: userRow.email };
    const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export default router;


