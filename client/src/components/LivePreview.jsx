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