import { fazerLogin, monitorarLogin } from "./auth.js";

const loginBtn = document.getElementById('loginBtn');

loginBtn.addEventListener('click', async () => {
  await fazerLogin();
});

monitorarLogin((user) => {
  if (user) {
    window.location.href = "/role.html";
  }
});
