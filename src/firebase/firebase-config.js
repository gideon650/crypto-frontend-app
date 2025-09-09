import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

// Firebase configuration with fallbacks to hard-coded values
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAf7y029COfcBwjrnFikMzq4XeLdGg9thk",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "amalunwa.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "amalunwa",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "amalunwa.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "582475691199",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:582475691199:web:0c8b2f91721a808e1e020a"
};

// Validate configuration
const validateConfig = (config) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
  }
  
  console.log('Firebase configuration validated successfully');
  return true;
};

// Validate before initializing
validateConfig(firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;

try {
  messaging = getMessaging(app);
  console.log('Firebase messaging initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase messaging:', error);
}

export { messaging, firebaseConfig };