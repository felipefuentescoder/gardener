import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Database from 'better-sqlite3'
import { mkdir } from 'fs/promises'
import path from 'path'

import authRoutes from './routes/auth.js'

dotenv.config()

const app = express()
const db = new Database(process.env.DB_PATH || './data.db')

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'))
app.use('/pages', express.static(process.env.PAGES_DIR || 'pages'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    tier TEXT DEFAULT 'free',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    theme TEXT DEFAULT 'classic-green',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

authRoutes(app, db)

await mkdir(process.env.UPLOAD_DIR || 'uploads', { recursive: true })
await mkdir(process.env.PAGES_DIR || 'pages', { recursive: true })

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})