import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
apiKey: "aqui su dato",
authDomain: "aqui su dato",
projectId: "aqui su dato",
storageBucket: "aqui su dato",
messagingSenderId: "aqui su dato",
appId: "aqiu su dato"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };