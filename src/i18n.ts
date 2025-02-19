import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
    .use(detector) // détection de la langue utilisateur
    .use(backend)  // pour le chargement des fichiers de traduction
    .use(initReactI18next) // passe i18n à react-i18next
    .init({
        fallbackLng: "en", // langue de secours
        keySeparator: false, // nous n'utilisons pas de séparateur pour les clés

        backend: {
            loadPath: `${process.env.NODE_ENV === "production" ? "./" : "/"}i18n-locales/{{lng}}/{{ns}}.json`
        },

        interpolation: {
                escapeValue: false // react se charge de la protection contre les XSS
        }
    });

export default i18n;