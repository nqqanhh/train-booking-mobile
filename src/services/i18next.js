import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "../../assets/locales/en.json";
import vi from "../../assets/locales/vi.json";

export const languageResource = {
  en: { translation: en },
  vi: { translation: vi },
};

const LANGUAGE_KEY = "selectedLanguage";

const getStoredLanguage = async () => {
  try {
    const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    return storedLang || "en";
  } catch (error) {
    console.error("Error retrieving language from storage:", error);
    return "en";
  }
};

i18next.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "en", // Default, will be overridden by stored language
  fallbackLng: "en",
  resources: languageResource,
});

// Load stored language after init
getStoredLanguage().then((lang) => {
  i18next.changeLanguage(lang);
});

// Function to change language and persist
export const changeLanguage = async (lang) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18next.changeLanguage(lang);
  } catch (error) {
    console.error("Error changing language:", error);
  }
};

export default i18next;
