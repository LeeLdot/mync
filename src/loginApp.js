//loginApp.js
import { fazerLogin, monitorarLogin } from "./auth.js";

const loginBtn = document.getElementById('loginBtn');

// Deixa o botão seguro contra múltiplos cliques
loginBtn.addEventListener('click', async () => {
  loginBtn.disabled = true; // Desabilita o botão imediatamente
  try {
    await fazerLogin();
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro ao fazer login. Tente novamente!");
    loginBtn.disabled = false; // Reabilita se der erro
  }
});

// Redireciona se o login for bem-sucedido
monitorarLogin((user) => {
  if (user) {
    window.location.href = "/role.html";
  }
});
