import { auth, provider } from "./firebaseConfig.js";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

export function fazerLogin() {
  return signInWithPopup(auth, provider);
}

export function monitorarLogin(callback) {
  onAuthStateChanged(auth, callback);
}

export function fazerLogout() {
  return signOut(auth);
}
