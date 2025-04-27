import { auth, provider } from "./firebaseConfig.js";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

export async function fazerLogin() {
  await signInWithPopup(auth, provider);
}

export function monitorarLogin(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

export async function fazerLogout() {
  await signOut(auth);
}
