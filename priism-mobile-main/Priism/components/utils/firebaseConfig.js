// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDHgIDkbRHem7KZLDAj647NJvfyN8D5IOs",
    authDomain: "priism-e69f0.firebaseapp.com",
    databaseURL: "https://priism-e69f0-default-rtdb.firebaseio.com",
    projectId: "priism-e69f0",
    storageBucket: "priism-e69f0.appspot.com",
    messagingSenderId: "1005119656870",
    appId: "1:1005119656870:web:a03ac406725177c976f567",
    measurementId: "G-EB054BV19T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
