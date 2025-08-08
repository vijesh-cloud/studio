
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "ecoverse-dzcey",
  "appId": "1:352417571073:web:a477bef8d5a7f1ec543b00",
  "storageBucket": "ecoverse-dzcey.appspot.com",
  "apiKey": "AIzaSyBHoKo3DfI5S-Jq8I0ePOkXtmOg2oOgyhk",
  "authDomain": "ecoverse-dzcey.firebaseapp.com",
  "messagingSenderId": "352417571073"
};


// Dynamically set authDomain for browser environments to avoid auth/unauthorized-domain errors
// in development environments with dynamic URLs.
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  (firebaseConfig as any).authDomain = window.location.hostname;
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

auth.useDeviceLanguage();

export { app, auth };
