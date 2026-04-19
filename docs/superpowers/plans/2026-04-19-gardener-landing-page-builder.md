# Gardener Landing Page Builder - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-service web app where gardeners fill out a form and get a landing page (HTML download, shareable URL, PDF)

**Architecture:** React SPA frontend + Express backend. Form wizard with live preview. Static HTML generation with embedded CSS. User auth with tiered access.

**Tech Stack:** React + Vite, Node.js/Express, PostgreSQL (or SQLite for dev), local file storage, Puppeteer for PDF

---

## File Structure

```
/home/elkim/vc/usingspw
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormWizard.jsx
│   │   │   ├── ThemeSelector.jsx
│   │   │   ├── LivePreview.jsx
│   │   │   └── ExportPanel.jsx
│   │   ├── hooks/
│   │   │   └── useFormData.js
│   │   ├── utils/
│   │   │   └── pageGenerator.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                     # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── pages.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── services/
│   │   │   ├── pdfGenerator.js
│   │   │   └── pageStorage.js
│   │   └── index.js
│   └── package.json
└── docs/superpowers/plans/
```

---

## Task 1: Project Setup - Frontend

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/index.html`
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`
- Create: `client/src/index.css`

- [ ] **Step 1: Create client/package.json**

```json
{
  "name": "gardener-landing-client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

- [ ] **Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gardener Landing Page Builder</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 5: Create src/App.jsx**

```jsx
import React from 'react'

function App() {
  return (
    <div>
      <h1>Gardener Landing Page Builder</h1>
    </div>
  )
}

export default App
```

- [ ] **Step 6: Create src/index.css**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}
```

- [ ] **Step 7: Install dependencies and verify build**

Run: `cd client && npm install`
Expected: Dependencies installed

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 8: Commit**

```bash
cd client && git init && git add -A && git commit -m "feat: scaffold React frontend"
```

---

## Task 2: Project Setup - Backend

**Files:**
- Create: `server/package.json`
- Create: `server/src/index.js`
- Create: `server/.env`

- [ ] **Step 1: Create server/package.json**

```json
{
  "name": "gardener-landing-server",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "better-sqlite3": "^9.2.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "puppeteer": "^21.7.0",
    "uuid": "^9.0.1"
  }
}
```

- [ ] **Step 2: Create server/.env**

```
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
DB_PATH=./data.db
UPLOAD_DIR=uploads
PAGES_DIR=pages
```

- [ ] **Step 3: Create server/src/index.js**

```javascript
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Database from 'better-sqlite3'
import { mkdir } from 'fs/promises'
import path from 'path'

dotenv.config()

const app = express()
const db = new Database(process.env.DB_PATH || './data.db')

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'))
app.use('/pages', express.static(process.env.PAGES_DIR || 'pages'))

// Initialize database tables
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

// Ensure directories exist
await mkdir(process.env.UPLOAD_DIR || 'uploads', { recursive: true })
await mkdir(process.env.PAGES_DIR || 'pages', { recursive: true })

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

- [ ] **Step 4: Install dependencies**

Run: `cd server && npm install`
Expected: Dependencies installed

- [ ] **Step 5: Test server startup**

Run: `cd server && npm run dev`
Expected: Server starts on port 3001

- [ ] **Step 6: Commit**

```bash
cd server && git init && git add -A && git commit -m "feat: scaffold Express backend"
```

---

## Task 3: Authentication - Backend

**Files:**
- Modify: `server/src/index.js`
- Create: `server/src/routes/auth.js`
- Create: `server/src/middleware/auth.js`

- [ ] **Step 1: Create auth routes (server/src/routes/auth.js)**

```javascript
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default function authRoutes(db) {
  const users = db.prepare('SELECT * FROM users WHERE email = ?')
  const insertUser = db.prepare('INSERT INTO users (id, email, password, tier) VALUES (?, ?, ?, ?)')
  const updateTier = db.prepare('UPDATE users SET tier = ? WHERE id = ?')

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

  return app
}
```

- [ ] **Step 2: Update server/src/index.js to use auth routes**

```javascript
import authRoutes from './routes/auth.js'

// ... after db setup ...
app.use(authRoutes(db))
```

- [ ] **Step 3: Test auth endpoints with curl**

Run: `curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}'`
Expected: Returns token and user object

Run: `curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}'`
Expected: Returns token and user object

- [ ] **Step 4: Commit**

```bash
git add server/src/index.js server/src/routes/auth.js && git commit -m "feat: add auth routes"
```

---

## Task 4: Form Component - Frontend

**Files:**
- Modify: `client/src/App.jsx`
- Create: `client/src/components/BusinessForm.jsx`

- [ ] **Step 1: Create BusinessForm component**

```jsx
import React, { useState } from 'react'

const initialData = {
  businessName: '',
  contact: { phone: '', email: '', address: '' },
  serviceArea: '',
  services: [],
  experience: '',
  certifications: '',
  portfolio: [],
  testimonials: []
}

const serviceOptions = [
  'Lawn Care',
  'Landscaping',
  'Tree Trimming',
  'Irrigation',
  'Flower Beds',
  'Garden Design'
]

export default function BusinessForm({ data, onChange }) {
  const [newService, setNewService] = useState('')

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  const handleContactChange = (field, value) => {
    onChange({
      ...data,
      contact: { ...data.contact, [field]: value }
    })
  }

  const toggleService = (service) => {
    const services = data.services.includes(service)
      ? data.services.filter(s => s !== service)
      : [...data.services, service]
    handleChange('services', services)
  }

  return (
    <div className="form-section">
      <h2>Business Information</h2>
      
      <div className="form-group">
        <label>Business Name</label>
        <input
          type="text"
          value={data.businessName}
          onChange={(e) => handleChange('businessName', e.target.value)}
          placeholder="Your Gardening Business"
        />
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          value={data.contact.phone}
          onChange={(e) => handleContactChange('phone', e.target.value)}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={data.contact.email}
          onChange={(e) => handleContactChange('email', e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="form-group">
        <label>Address</label>
        <input
          type="text"
          value={data.contact.address}
          onChange={(e) => handleContactChange('address', e.target.value)}
          placeholder="123 Garden St, City, State"
        />
      </div>

      <div className="form-group">
        <label>Service Area (zip codes or cities)</label>
        <input
          type="text"
          value={data.serviceArea}
          onChange={(e) => handleChange('serviceArea', e.target.value)}
          placeholder="90210, Beverly Hills, CA"
        />
      </div>

      <div className="form-group">
        <label>Services Offered</label>
        <div className="checkbox-group">
          {serviceOptions.map(service => (
            <label key={service}>
              <input
                type="checkbox"
                checked={data.services.includes(service)}
                onChange={() => toggleService(service)}
              />
              {service}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Years of Experience</label>
        <input
          type="text"
          value={data.experience}
          onChange={(e) => handleChange('experience', e.target.value)}
          placeholder="10 years"
        />
      </div>

      <div className="form-group">
        <label>Certifications / Licenses</label>
        <textarea
          value={data.certifications}
          onChange={(e) => handleChange('certifications', e.target.value)}
          placeholder="Licensed & Insured, Certified Arborist..."
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update App.jsx with form**

```jsx
import React, { useState } from 'react'
import BusinessForm from './components/BusinessForm'

function App() {
  const [formData, setFormData] = useState({})

  return (
    <div className="app">
      <header>
        <h1>Gardener Landing Page Builder</h1>
      </header>
      <main>
        <BusinessForm data={formData} onChange={setFormData} />
      </main>
    </div>
  )
}

export default App
```

- [ ] **Step 3: Add form styles to index.css**

```css
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 30px;
}

.form-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.checkbox-group label {
  display: inline-block;
  margin-right: 20px;
  font-weight: normal;
}

.checkbox-group input {
  margin-right: 8px;
}
```

- [ ] **Step 4: Test the form**

Run: `cd client && npm run dev`
Expected: Form renders, inputs work

- [ ] **Step 5: Commit**

```bash
git add client/src/components/BusinessForm.jsx client/src/App.jsx client/src/index.css && git commit -m "feat: add business form component"
```

---

## Task 5: Theme Selector - Frontend

**Files:**
- Create: `client/src/components/ThemeSelector.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Create ThemeSelector component**

```jsx
import React from 'react'

const themes = [
  {
    id: 'classic-green',
    name: 'Classic Green',
    primary: '#2d5a27',
    secondary: '#4a7c42',
    background: '#ffffff',
    text: '#333333'
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    primary: '#1a1a1a',
    secondary: '#666666',
    background: '#fafafa',
    text: '#222222'
  },
  {
    id: 'earthy-natural',
    name: 'Earthy Natural',
    primary: '#8b4513',
    secondary: '#d2691e',
    background: '#f5f0e6',
    text: '#3d2914'
  }
]

export default function ThemeSelector({ theme, onChange }) {
  return (
    <div className="theme-section">
      <h2>Choose a Theme</h2>
      <div className="theme-grid">
        {themes.map(t => (
          <div
            key={t.id}
            className={`theme-card ${theme.id === t.id ? 'selected' : ''}`}
            onClick={() => onChange(t)}
          >
            <div
              className="theme-preview"
              style={{
                backgroundColor: t.background,
                borderTop: `4px solid ${t.primary}`
              }}
            >
              <div style={{ color: t.primary }}>{t.name}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="customize-section">
        <h3>Customize Colors</h3>
        <div className="color-inputs">
          <label>
            Primary Color
            <input
              type="color"
              value={theme.primary}
              onChange={(e) => onChange({ ...theme, primary: e.target.value })}
            />
          </label>
          <label>
            Secondary Color
            <input
              type="color"
              value={theme.secondary}
              onChange={(e) => onChange({ ...theme, secondary: e.target.value })}
            />
          </label>
          <label>
            Background Color
            <input
              type="color"
              value={theme.background}
              onChange={(e) => onChange({ ...theme, background: e.target.value })}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add theme styles**

```css
.theme-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.theme-card {
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}

.theme-card.selected {
  border-color: #2d5a27;
}

.theme-preview {
  padding: 20px;
  height: 80px;
}

.customize-section h3 {
  margin-bottom: 15px;
}

.color-inputs {
  display: flex;
  gap: 20px;
}

.color-inputs label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-inputs input[type="color"] {
  width: 60px;
  height: 40px;
  cursor: pointer;
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/ThemeSelector.jsx client/src/index.css && git commit -m "feat: add theme selector component"
```

---

## Task 6: Page Generator - Core Logic

**Files:**
- Create: `client/src/utils/pageGenerator.js`

- [ ] **Step 1: Create page generator utility**

```javascript
export function generateLandingPage(businessData, theme) {
  const { businessName, contact, serviceArea, services, experience, certifications, portfolio, testimonials } = businessData

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName || 'Gardening Services'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: ${theme.text};
      background: ${theme.background};
    }
    .header {
      background: ${theme.primary};
      color: white;
      padding: 60px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 1.2em;
      opacity: 0.9;
    }
    .nav {
      background: ${theme.secondary};
      padding: 15px 20px;
      text-align: center;
    }
    .nav a {
      color: white;
      text-decoration: none;
      margin: 0 15px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .section {
      margin-bottom: 50px;
    }
    .section h2 {
      color: ${theme.primary};
      margin-bottom: 20px;
      font-size: 1.8em;
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    .service-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .contact-info {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .contact-info p {
      margin-bottom: 10px;
    }
    .portfolio-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    .portfolio-item {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .portfolio-item img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .testimonial {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .testimonial cite {
      display: block;
      margin-top: 10px;
      font-style: normal;
      color: ${theme.secondary};
    }
    .cta-button {
      display: inline-block;
      background: ${theme.primary};
      color: white;
      padding: 15px 30px;
      border-radius: 5px;
      text-decoration: none;
      font-size: 1.1em;
      margin-top: 15px;
    }
    footer {
      background: ${theme.primary};
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>${businessName || 'Professional Gardening Services'}</h1>
    <p>${serviceArea ? `Serving ${serviceArea}` : 'Quality Gardening Services'}</p>
  </header>
  
  <nav class="nav">
    <a href="#services">Services</a>
    <a href="#about">About</a>
    <a href="#portfolio">Portfolio</a>
    <a href="#testimonials">Testimonials</a>
    <a href="#contact">Contact</a>
  </nav>
  
  <div class="container">
    <section class="section" id="services">
      <h2>Our Services</h2>
      ${services && services.length > 0 ? `
        <div class="services-grid">
          ${services.map(s => `
            <div class="service-card">${s}</div>
          `).join('')}
        </div>
      ` : '<p>Contact us to learn about our services.</p>'}
    </section>
    
    <section class="section" id="about">
      <h2>About Us</h2>
      ${experience ? `<p><strong>Experience:</strong> ${experience}</p>` : ''}
      ${certifications ? `<p><strong>Certifications:</strong> ${certifications}</p>` : ''}
    </section>
    
    <section class="section" id="contact">
      <h2>Contact Us</h2>
      <div class="contact-info">
        ${contact?.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
        ${contact?.email ? `<p><strong>Email:</strong> ${contact.email}</p>` : ''}
        ${contact?.address ? `<p><strong>Address:</strong> ${contact.address}</p>` : ''}
        ${contact?.phone ? `<a href="tel:${contact.phone}" class="cta-button">Call Now</a>` : ''}
      </div>
    </section>
  </div>
  
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${businessName || 'Gardening Services'}</p>
  </footer>
</body>
</html>
`
  return html
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/utils/pageGenerator.js && git commit -m "feat: add landing page generator"
```

---

## Task 7: Live Preview - Frontend

**Files:**
- Create: `client/src/components/LivePreview.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Create LivePreview component**

```jsx
import React, { useMemo } from 'react'
import { generateLandingPage } from '../utils/pageGenerator'

export default function LivePreview({ businessData, theme }) {
  const previewHtml = useMemo(() => {
    return generateLandingPage(businessData, theme)
  }, [businessData, theme])

  return (
    <div className="preview-section">
      <h2>Live Preview</h2>
      <div className="preview-frame">
        <iframe
          srcDoc={previewHtml}
          title="Landing Page Preview"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add preview styles**

```css
.preview-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.preview-frame {
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.preview-frame iframe {
  width: 100%;
  height: 500px;
  border: none;
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/LivePreview.jsx client/src/index.css && git commit -m "feat: add live preview component"
```

---

## Task 8: Export Functionality

**Files:**
- Create: `client/src/components/ExportPanel.jsx`
- Modify: `client/src/App.jsx`
- Modify: `server/src/routes/pages.js`

- [ ] **Step 1: Create server pages route**

```javascript
import { v4 as uuid } from 'uuid'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export default function pageRoutes(db) {
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

  app.post('/api/pages', async (req, res) => {
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

  return app
}
```

- [ ] **Step 2: Update server/src/index.js**

```javascript
import pageRoutes from './routes/pages.js'
app.use(pageRoutes(db))
```

- [ ] **Step 3: Create ExportPanel component**

```jsx
import React, { useState } from 'react'
import { generateLandingPage } from '../utils/pageGenerator'

export default function ExportPanel({ businessData, theme }) {
  const [saving, setSaving] = useState(false)

  const handleDownloadHTML = () => {
    const html = generateLandingPage(businessData, theme)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${businessData.businessName || 'landing'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSaveToCloud = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: businessData.businessName || 'My Landing Page',
          data: businessData,
          theme: theme.id
        })
      })
      alert('Page saved!')
    } catch (err) {
      alert('Failed to save page')
    }
    setSaving(false)
  }

  return (
    <div className="export-section">
      <h2>Export Your Page</h2>
      <div className="export-buttons">
        <button onClick={handleDownloadHTML} className="btn-primary">
          Download HTML
        </button>
        <button onClick={handleSaveToCloud} disabled={saving} className="btn-secondary">
          {saving ? 'Saving...' : 'Save to Cloud'}
        </button>
      </div>
      <p className="export-note">
        Download HTML to host anywhere. Save to cloud for a free URL.
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Add export styles**

```css
.export-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.export-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.btn-primary {
  background: #2d5a27;
  color: white;
}

.btn-secondary {
  background: #666;
  color: white;
}

.btn-primary:hover {
  background: #234a1f;
}

.export-note {
  color: #666;
  font-size: 14px;
}
```

- [ ] **Step 5: Commit**

```bash
git add client/src/components/ExportPanel.jsx server/src/routes/pages.js && git commit -m "feat: add export functionality"
```

---

## Task 9: PDF Generation (Backend)

**Files:**
- Create: `server/src/services/pdfGenerator.js`
- Modify: `server/src/routes/pages.js`

- [ ] **Step 1: Create PDF generator service**

```javascript
import puppeteer from 'puppeteer'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function generatePDF(html, outputPath) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  
  await page.setContent(html)
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true
  })
  
  await browser.close()
  return outputPath
}
```

- [ ] **Step 2: Add PDF download route**

```javascript
app.post('/api/pages/:id/pdf', async (req, res) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Not authenticated' })
  
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET)
    if (decoded.tier !== 'paid') {
      return res.status(403).json({ error: 'PDF download requires paid tier' })
    }
    
    const page = pages.get(req.params.id)
    if (!page) return res.status(404).json({ error: 'Page not found' })
    
    const { generatePDF } = await import('./services/pdfGenerator.js')
    const outputPath = path.join(process.env.PAGES_DIR, `${page.id}.pdf`)
    
    await generatePDF(page.data, outputPath)
    
    res.download(outputPath)
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
})
```

- [ ] **Step 3: Commit**

```bash
git add server/src/services/pdfGenerator.js && git commit -m "feat: add PDF generation service"
```

---

## Task 10: Integration - Connect Everything

**Files:**
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Update App.jsx to integrate all components**

```jsx
import React, { useState, useEffect } from 'react'
import BusinessForm from './components/BusinessForm'
import ThemeSelector from './components/ThemeSelector'
import LivePreview from './components/LivePreview'
import ExportPanel from './components/ExportPanel'

const defaultTheme = {
  id: 'classic-green',
  name: 'Classic Green',
  primary: '#2d5a27',
  secondary: '#4a7c42',
  background: '#ffffff',
  text: '#333333'
}

function App() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [theme, setTheme] = useState(defaultTheme)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data.user))
        .catch(() => {})
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('token', userData.token)
  }

  return (
    <div className="app">
      <header>
        <h1>Gardener Landing Page Builder</h1>
        {user && <p>Welcome, {user.email}</p>}
      </header>
      
      <main>
        {!user ? (
          <div className="auth-prompt">
            <p>Please log in to create your landing page.</p>
            {/* Add login/register form here */}
          </div>
        ) : (
          <>
            <div className="wizard-steps">
              <button
                className={step === 1 ? 'active' : ''}
                onClick={() => setStep(1)}
              >
                1. Business Info
              </button>
              <button
                className={step === 2 ? 'active' : ''}
                onClick={() => setStep(2)}
              >
                2. Choose Theme
              </button>
              <button
                className={step === 3 ? 'active' : ''}
                onClick={() => setStep(3)}
              >
                3. Preview
              </button>
              <button
                className={step === 4 ? 'active' : ''}
                onClick={() => setStep(4)}
              >
                4. Export
              </button>
            </div>
            
            {step === 1 && (
              <BusinessForm data={formData} onChange={setFormData} />
            )}
            {step === 2 && (
              <ThemeSelector theme={theme} onChange={setTheme} />
            )}
            {step === 3 && (
              <LivePreview businessData={formData} theme={theme} />
            )}
            {step === 4 && (
              <ExportPanel businessData={formData} theme={theme} />
            )}
            
            <div className="navigation">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)}>Back</button>
              )}
              {step < 4 && (
                <button onClick={() => setStep(step + 1)}>Next</button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
```

- [ ] **Step 2: Add wizard styles**

```css
.wizard-steps {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.wizard-steps button {
  flex: 1;
  padding: 15px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.wizard-steps button.active {
  border-color: #2d5a27;
  background: #2d5a27;
  color: white;
}

.navigation {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.navigation button {
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  background: #2d5a27;
  color: white;
}

.navigation button:hover {
  background: #234a1f
}

.auth-prompt {
  text-align: center;
  padding: 40px;
  background: #f9f9f9;
  border-radius: 8px;
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/App.jsx client/src/index.css && git commit -m "feat: integrate all components"
```

---

## Task Summary

| Task | Component | Files Modified/Created |
|------|-----------|---------------------|
| 1 | Project Setup - Frontend | client/* |
| 2 | Project Setup - Backend | server/* |
| 3 | Authentication | server/src/routes/auth.js |
| 4 | Form Component | client/src/components/BusinessForm.jsx |
| 5 | Theme Selector | client/src/components/ThemeSelector.jsx |
| 6 | Page Generator | client/src/utils/pageGenerator.js |
| 7 | Live Preview | client/src/components/LivePreview.jsx |
| 8 | Export Functionality | client/src/components/ExportPanel.jsx |
| 9 | PDF Generation | server/src/services/pdfGenerator.js |
| 10 | Integration | client/src/App.jsx |

---

## Plan Complete

**Running verify:** Build client and server to ensure compilation.

Run: `cd client && npm run build`
Expected: Build succeeds

Run: `cd server && npm run dev &` then `curl localhost:3001/api/health`
Expected: Returns {"status":"ok"}

---

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**