import { v4 as uuid } from 'uuid'
import jwt from 'jsonwebtoken'

export default function pageRoutes(app, db) {
  const pages = db.prepare('SELECT * FROM pages WHERE id = ?')
  const userPages = db.prepare('SELECT * FROM pages WHERE user_id = ?')
  const insertPage = db.prepare('INSERT INTO pages (id, user_id, name, data, theme) VALUES (?, ?, ?, ?, ?)')
  const deletePage = db.prepare('DELETE FROM pages WHERE id = ?')

  app.get('/api/pages', (req, res) => {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'Not authenticated' })

    try {
      const decoded = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET)
      const userPagesList = userPages.all(decoded.id)
      res.json(userPagesList)
    } catch {
      res.status(401).json({ error: 'Invalid token' })
    }
  })

  app.post('/api/pages', (req, res) => {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'Not authenticated' })

    try {
      const decoded = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET)
      const { name, data, theme } = req.body

      const id = uuid()
      insertPage.run(id, decoded.id, name, JSON.stringify(data), theme)

      res.json({ id, name })
    } catch {
      res.status(401).json({ error: 'Invalid token' })
    }
  })

  app.get('/api/pages/:id', (req, res) => {
    const page = pages.get(req.params.id)
    if (!page) return res.status(404).json({ error: 'Page not found' })
    res.json(page)
  })

  app.delete('/api/pages/:id', (req, res) => {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ error: 'Not authenticated' })

    try {
      const decoded = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET)
      deletePage.run(req.params.id)
      res.json({ success: true })
    } catch {
      res.status(401).json({ error: 'Invalid token' })
    }
  })
}