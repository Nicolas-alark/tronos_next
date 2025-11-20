import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";       // <- Funciones de firebase ya incluidas
import { getFirestore } from "firebase/firestore"; // <- Esto también viene en firebase

const firebaseConfig = {
  apiKey: "AIzaSyAFfNz1QVi6BN6CE6hd93flSAtoph-xnYw",
  authDomain: "tronos-api-d478e.firebaseapp.com",
  projectId: "tronos-api-d478e",
  storageBucket: "tronos-api-d478e.appspot.com",
  messagingSenderId: "336649247590",
  appId: "1:336649247590:web:d4bfaf2bdcd0c89c1b06a7"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);  // <- Aquí ya funciona
const db = getFirestore(app); // <- Aquí también

export { auth, db };
