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