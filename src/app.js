import { fazerLogin, monitorarLogin, fazerLogout } from "./auth.js";
import { gerarCodigo } from "./utils.js";
import { enviarVideo, escutarAtualizacoesHost, atualizarTempo, playVideo, pauseVideo } from "./host.js";
import { escutarAtualizacoesViewer } from "./viewer.js";
import { auth } from "./firebaseConfig.js";

const loginSection = document.getElementById('loginSection');
const chooseRole = document.getElementById('chooseRole');
const hostSection = document.getElementById('hostSection');
const viewerSection = document.getElementById('viewerSection');
const playerFrame = document.getElementById('playerFrame');

let codigoAtual = "";
let isHost = false;

document.getElementById('loginBtn').addEventListener('click', async () => {
  await fazerLogin();
});

monitorarLogin((user) => {
  if (user) {
    loginSection.style.display = "none";
    chooseRole.style.display = "block";
    document.getElementById('userPhoto').src = user.photoURL;
    document.getElementById('userInfo').style.display = "block";
  } else {
    location.reload();
  }
});

document.getElementById('chooseHost').addEventListener('click', () => {
  isHost = true;
  chooseRole.style.display = "none";
  hostSection.style.display = "block";

  codigoAtual = gerarCodigo();
  document.getElementById('codigoGerado').innerText = codigoAtual;
  playerFrame.style.display = "block";

  escutarAtualizacoesHost(codigoAtual, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.videoId) carregarVideo(data.videoId);
    }
  });

  atualizarTempoPeriodicamente();
});

document.getElementById('chooseViewer').addEventListener('click', () => {
  chooseRole.style.display = "none";
  viewerSection.style.display = "block";
});

document.getElementById('sendLink').addEventListener('click', () => {
  const url = document.getElementById('videoUrl').value;
  enviarVideo(codigoAtual, url, auth.currentUser.uid);
  carregarVideo(url);
});

document.getElementById('connectBtn').addEventListener('click', () => {
  const codigo = document.getElementById('viewerCodeInput').value;
  codigoAtual = codigo;
  playerFrame.style.display = "block";

  escutarAtualizacoesViewer(codigoAtual, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.videoId) carregarVideo(data.videoId);
      document.getElementById('viewerStatus').innerText = "🎶 Conectado!";
    } else {
      document.getElementById('viewerStatus').innerText = "❌ Código inválido!";
    }
  });
});

function carregarVideo(videoId) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  playerFrame.src = embedUrl;
}

function atualizarTempoPeriodicamente() {
  setInterval(() => {
    if (isHost) {
      playerFrame.contentWindow.postMessage('{"event":"listening","id":1}', '*');
    }
  }, 2000);
}
