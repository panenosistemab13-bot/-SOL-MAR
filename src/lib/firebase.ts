import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAWQcPEAgpKRYF63hArVYb02zY2kGkuA8M",
  authDomain: "sol-e-mar-bb1c7.firebaseapp.com",
  databaseURL: "https://sol-e-mar-bb1c7-default-rtdb.firebaseio.com",
  projectId: "sol-e-mar-bb1c7",
  storageBucket: "sol-e-mar-bb1c7.firebasestorage.app",
  messagingSenderId: "3452971309",
  appId: "1:3452971309:web:a9dc2726a6d71bc5200ba4",
  measurementId: "G-7262VV8QZ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const rtdb = getDatabase(app);
