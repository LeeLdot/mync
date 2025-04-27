import { fazerLogout } from "./auth.js";
import { configurarViewerPlayer, escutarAtualizacoesViewer } from "./viewer.js";

const logoutBtn = document.getElementById('logoutBtn');
const connectBtn = document.getElementById('connectBtn');
const playerFrame = document.getElementById('playerFrame');
const viewerStatus = document.getElementById('viewerStatus');
const viewerCodeInput = document.getElementById('viewerCodeInput');

let codigoAtual = "";

logoutBtn.addEventListener('click', async () => {
  await fazerLogout();
  window.location.href = "/login.html";
});

connectBtn.addEventListener('click', () => {
  const codigo = viewerCodeInput.value.trim();
  if (!codigo) {
    viewerStatus.innerText = "❌ Código inválido!";
    return;
  }

  codigoAtual = codigo;
  playerFrame.style.display = "block";

  configurarViewerPlayer(playerFrame);
  escutarAtualizacoesViewer(codigoAtual);

  viewerStatus.innerText = "🎶 Conectado!";
});
