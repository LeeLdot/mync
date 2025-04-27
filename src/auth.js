import { auth, provider } from "./firebaseConfig.js";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

// Função para fazer login com Google
export async function fazerLogin() {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Erro ao fazer login. Tente novamente!");
  }
}

// Função para monitorar se o usuário está logado ou deslogado
export function monitorarLogin(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

// Função para logout
export async function fazerLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    alert("Erro ao fazer logout. Tente novamente!");
  }
}
