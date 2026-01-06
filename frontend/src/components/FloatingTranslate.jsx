import React, { useEffect } from 'react'
import './FloatingTranslate.css'

function FloatingTranslate() {
  useEffect(() => {
    // Wait for Google Translate to load, then initialize
    function initTranslate() {
      if (window.google && window.google.translate) {
        const translateElement = document.getElementById('floating_google_translate_element')
        if (translateElement && !translateElement.hasChildNodes()) {
          try {
            new window.google.translate.TranslateElement(
              { pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
              'floating_google_translate_element'
            )
          } catch (e) {
            // Widget already initialized or error occurred
            console.log('Google Translate initialization:', e.message)
          }
        }
      } else {
        // Retry after a short delay if Google Translate hasn't loaded yet
        setTimeout(initTranslate, 100)
      }
    }
    
    // Start initialization after a brief delay to ensure DOM is ready
    setTimeout(initTranslate, 100)
  }, [])

  return (
    <div className="floating-translate-container">
      <div id="floating_google_translate_element" className="floating-translate-wrapper"></div>
    </div>
  )
}

export default FloatingTranslate
