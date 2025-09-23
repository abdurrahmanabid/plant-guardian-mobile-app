import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import bn from "./locales/bn/common.json";
import homeBn from "./locales/bn/home.json";
import leafPredictBn from "./locales/bn/leafPredict.json";
import loginBn from "./locales/bn/login.json";
import profileBn from "./locales/bn/profile.json";
import registrationBn from "./locales/bn/registration.json";
import savedBn from "./locales/bn/saved.json";
import searchBn from "./locales/bn/search.json";
import soilInputBn from "./locales/bn/soil-input.json";
import en from "./locales/en/common.json";
import homeEn from "./locales/en/home.json";
import leafPredictEn from "./locales/en/leafPredict.json";
import loginEn from "./locales/en/login.json";
import profileEn from "./locales/en/profile.json";
import registrationEn from "./locales/en/registration.json";
import savedEn from "./locales/en/saved.json";
import searchEn from "./locales/en/search.json";
import soilInputEn from "./locales/en/soil-input.json";

const resources = {
  en: { common: en, home: homeEn, search: searchEn, saved: savedEn, profile: profileEn, login: loginEn, registration: registrationEn, leafPredict: leafPredictEn, soilInput: soilInputEn },
  bn: { common: bn, home: homeBn, search: searchBn, saved: savedBn, profile: profileBn, login: loginBn, registration: registrationBn, leafPredict: leafPredictBn, soilInput: soilInputBn },
};

const deviceLanguageCode = (Localization.getLocales?.()[0]?.languageCode ?? "en") as
  | "en"
  | "bn";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources,
  lng: ["en", "bn"].includes(deviceLanguageCode) ? deviceLanguageCode : "en",
  fallbackLng: "bn",
  ns: ["common", "home", "search", "saved", "profile", "login", "registration", "leafPredict", "soilInput"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
  returnEmptyString: false,
  react: { useSuspense: false },
});

export default i18n;


