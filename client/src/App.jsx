import React, { useState, useEffect } from 'react'
import BusinessForm from './components/BusinessForm'
import ThemeSelector from './components/ThemeSelector'
import LivePreview from './components/LivePreview'
import ExportPanel from './components/ExportPanel'
import AuthForm from './components/AuthForm'

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
    setUser(userData.user)
    localStorage.setItem('token', userData.token)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    setStep(1)
    setFormData({})
  }

  return (
    <div className="app">
      <header>
        <h1>Gardener Landing Page Builder</h1>
        {user && (
          <div className="user-info">
            <span>{user.email}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </header>
      
      <main>
        {!user ? (
          <AuthForm onLogin={handleLogin} />
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