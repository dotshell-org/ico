import i18n from 'i18next'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

// Function to get the saved language or use browser/system language
const getSavedLanguage = () => {
    const savedLanguage = localStorage.getItem('language')
    
    // If we have a saved language, use it
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
        return savedLanguage
    }
    
    // Otherwise, try to use the browser language or fall back to English
    const browserLanguage = navigator.language.substring(0, 2)
    return (browserLanguage === 'fr') ? 'fr' : 'en'
}

// Initialize i18next
void i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        lng: getSavedLanguage(),
        debug: process.env.NODE_ENV === 'development',
        backend: {
            loadPath: './i18n-locales/{{lng}}/{{ns}}.json'
        },
        interpolation: {
            escapeValue: false,
        },
    })

// Add a listener for language changes from the main process
if ((window as any).ipcRenderer) {
    (window as any).ipcRenderer.on('language-changed', (_event: any, language: string | undefined) => {
        if (language && (language === 'en' || language === 'fr')) {
            void i18n.changeLanguage(language)
            localStorage.setItem('language', language)
        }
    })
}

// Function to change the language
export const changeLanguage = async (language: string) => {
    if (language && (language === 'en' || language === 'fr')) {
        await i18n.changeLanguage(language)
        localStorage.setItem('language', language)
        
        // Inform the main process about the language change
        if ((window as any).ipcRenderer) {
            await (window as any).ipcRenderer.invoke('changeLanguage', language)
        }
        
        return true
    }
    return false
}

export default i18n