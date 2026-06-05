import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBOhbZXMiPZ76g4MEQoJ3VznxO4xl7cIGw",
  authDomain: "badminton-project-b85a3.firebaseapp.com",
  projectId: "badminton-project-b85a3",
  storageBucket: "badminton-project-b85a3.firebasestorage.app",
  messagingSenderId: "153082698245",
  appId: "1:153082698245:web:adef91dea5b0951bc8da6c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
