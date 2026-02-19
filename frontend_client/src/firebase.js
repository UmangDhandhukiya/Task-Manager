import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MSG_SENDER_ID,
  appId: process.env.APP_ID
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
