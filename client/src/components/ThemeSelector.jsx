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