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
  viewerStatus.innerText = "⏳ Carregando player...";

  // ✅ CRIAR o iframe dinamicamente
  const iframe = document.createElement('iframe');
  iframe.id = "playerFrame";
  iframe.frameBorder = "0";
  iframe.allow = "autoplay; fullscreen";
  iframe.allowTransparency = "true";
  iframe.style.width = "100%";
  iframe.style.height = "400px";
  iframe.src = "https://www.youtube.com/embed/M7lc1UVf-VE?enablejsapi=1&autoplay=0";
  
  const playerArea = document.getElementById('playerArea');
  playerArea.innerHTML = ""; // Limpa área
  playerArea.appendChild(iframe);

  // ✅ Cria o YT.Player já no iframe criado
  ytPlayerViewer = new YT.Player('playerFrame', {
    events: {
      'onReady': () => {
        configurarViewerPlayer(ytPlayerViewer);
        escutarAtualizacoesViewer(codigoAtual);
        viewerStatus.innerText = "🎶 Conectado!";
      }
    }
  });
});
