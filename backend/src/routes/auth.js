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
  
  // Check if user already exists
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Hash password and insert user
    const passwordHash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)', 
      [username, email, passwordHash], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Server error' });
        }
        
        const user = { id: this.lastID, username, email };
        const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d' });
        res.json({ user, token });
      });
  });
});

router.post('/login', (req, res) => {
  const db = req.app.get('db');
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, userRow) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (!userRow) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const ok = bcrypt.compareSync(password, userRow.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = { id: userRow.id, username: userRow.username, email: userRow.email };
    const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d' });
    res.json({ user, token });
  });
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


