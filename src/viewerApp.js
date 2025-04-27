import { fazerLogout } from "./auth.js";
import { db } from "./firebaseConfig.js";
import { ref, get } from "firebase/database";
import { configurarViewerPlayer, escutarAtualizacoesViewer } from "./viewer.js";

const logoutBtn = document.getElementById('logoutBtn');
const connectBtn = document.getElementById('connectBtn');
const playerArea = document.getElementById('playerArea');
const viewerStatus = document.getElementById('viewerStatus');
const viewerCodeInput = document.getElementById('viewerCodeInput');

let codigoAtual = "";
let ytPlayerViewer = null;

logoutBtn.addEventListener('click', async () => {
  await fazerLogout();
  window.location.href = "/login.html";
});

connectBtn.addEventListener('click', async () => {
  const codigo = viewerCodeInput.value.trim();
  if (!codigo) {
    viewerStatus.innerText = "❌ Código inválido!";
    return;
  }

  codigoAtual = codigo;
  viewerStatus.innerText = "⏳ Conectando...";

  const codigoRef = ref(db, `codigos/${codigoAtual}`);
  const snapshot = await get(codigoRef);

  if (!snapshot.exists()) {
    viewerStatus.innerText = "❌ Código não encontrado!";
    return;
  }

  // Sala existe
  criarIframe();
});

function criarIframe() {
  const iframe = document.createElement('iframe');
  iframe.id = "playerFrame";
  iframe.frameBorder = "0";
  iframe.allow = "autoplay; fullscreen";
  iframe.allowTransparency = "true";
  iframe.style.width = "100%";
  iframe.style.height = "400px";
  iframe.src = "https://www.youtube.com/embed/?enablejsapi=1"; // 🔥 Aqui é o segredo!

  playerArea.innerHTML = "";
  playerArea.appendChild(iframe);

  setTimeout(() => {
    ytPlayerViewer = new YT.Player('playerFrame', {
      events: {
        'onReady': () => {
          configurarViewerPlayer(ytPlayerViewer);
          viewerStatus.innerText = "🎶 Conectado!";
          escutarAtualizacoesViewer(codigoAtual);
        }
      }
    });
  }, 300);
}
