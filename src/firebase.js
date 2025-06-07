// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDPLmrk7AbeZdAQHmGkZJfpC4Fp0ltyKE",
  authDomain: "career-path-builder-cf8df.firebaseapp.com",
  projectId: "career-path-builder-cf8df",
  storageBucket: "career-path-builder-cf8df.firebasestorage.app",
  messagingSenderId: "853534340072",
  appId: "1:853534340072:web:b2f548a8f067bd609fea5d",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Function to update user profile in Firestore
export const updateFirebaseProfile = async (userId, profileData) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, profileData, { merge: true });
};
