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