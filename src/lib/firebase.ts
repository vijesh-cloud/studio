
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBHoKo3DfI5S-Jq8I0ePOkXtmOg2oOgyhk",
  authDomain: "ecoverse-dzcey.firebaseapp.com",
  projectId: "ecoverse-dzcey",
  storageBucket: "ecoverse-dzcey.firebasestorage.app",
  messagingSenderId: "352417571073",
  appId: "1:352417571073:web:a477bef8d5a7f1ec543b00"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
