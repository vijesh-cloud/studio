
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "ecoverse-dzcey",
  "appId": "1:352417571073:web:a477bef8d5a7f1ec543b00",
  "storageBucket": "ecoverse-dzcey.appspot.com",
  "apiKey": "AIzaSyBHoKo3DfI5S-Jq8I0ePOkXtmOg2oOgyhk",
  "authDomain": "localhost",
  "messagingSenderId": "352417571073"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

auth.useDeviceLanguage();

export { app, auth };
