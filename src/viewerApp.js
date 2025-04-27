import { fazerLogout } from "./auth.js";
import { configurarViewerPlayer, escutarAtualizacoesViewer } from "./viewer.js";

const logoutBtn = document.getElementById('logoutBtn');
const connectBtn = document.getElementById('connectBtn');
const playerFrame = document.getElementById('playerFrame');
const viewerStatus = document.getElementById('viewerStatus');
const viewerCodeInput = document.getElementById('viewerCodeInput');

let codigoAtual = "";
let ytPlayerViewer = null;

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

  viewerStatus.innerText = "⏳ Carregando player...";
});

// Deixa o iframe src vazio - YouTube API ainda vai carregar normal
window.onYouTubeIframeAPIReady = () => {
  ytPlayerViewer = new YT.Player('playerFrame', {
    events: {
      'onReady': () => {
        configurarViewerPlayer(ytPlayerViewer);
        escutarAtualizacoesViewer(codigoAtual);
        viewerStatus.innerText = "🎶 Conectado!";
      }
    }
  });
};
