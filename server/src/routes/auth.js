import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default function authRoutes(app, db) {
  const users = db.prepare('SELECT * FROM users WHERE email = ?')
  const insertUser = db.prepare('INSERT INTO users (id, email, password, tier) VALUES (?, ?, ?, ?)')

  app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const existing = users.get(email)
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const id = uuid()
    insertUser.run(id, email, hashed, 'free')

    const token = jwt.sign({ id, email, tier: 'free' }, process.env.JWT_SECRET)
    res.json({ token, user: { id, email, tier: 'free' } })
  })

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body

    const user = users.get(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id, email: user.email, tier: user.tier }, process.env.JWT_SECRET)
    res.json({ token, user: { id: user.id, email: user.email, tier: user.tier } })
  })

  app.get('/api/auth/me', (req, res) => {
    const auth = req.headers.authorization
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    try {
      const decoded = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET)
      res.json({ user: { id: decoded.id, email: decoded.email, tier: decoded.tier } })
    } catch {
      res.status(401).json({ error: 'Invalid token' })
    }
  })
}