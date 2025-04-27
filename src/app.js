import { fazerLogin, monitorarLogin, fazerLogout } from "./auth.js";
import { gerarCodigo } from "./utils.js";
import { enviarVideo, escutarAtualizacoesHost, atualizarTempo, playVideo, pauseVideo } from "./host.js";
import { escutarAtualizacoesViewer } from "./viewer.js";
import { auth, db } from "./firebaseConfig.js";
import { ref, set } from "firebase/database";

const loginSection = document.getElementById('loginSection');
const chooseRole = document.getElementById('chooseRole');
const hostSection = document.getElementById('hostSection');
const viewerSection = document.getElementById('viewerSection');
const playerFrame = document.getElementById('playerFrame');

const userPhoto = document.getElementById('userPhoto');
const userInfo = document.getElementById('userInfo');
const userMenu = document.getElementById('userMenu');

let codigoAtual = "";
let isHost = false;

// LOGIN
document.getElementById('loginBtn').addEventListener('click', async () => {
  await fazerLogin();
});

// MONITORAR LOGIN
monitorarLogin((user) => {
  if (user) {
    loginSection.style.display = "none";
    chooseRole.style.display = "block";
    userPhoto.src = user.photoURL;
    userInfo.style.display = "block";
  } else {
    loginSection.style.display = "block";
    chooseRole.style.display = "none";
    hostSection.style.display = "none";
    viewerSection.style.display = "none";
    playerFrame.style.display = "none";
  }
});

// ABRIR MENU USUÁRIO
userPhoto.addEventListener('click', () => {
  userMenu.style.display = userMenu.style.display === "none" ? "flex" : "none";
});

// LOGOUT
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fazerLogout();
  loginSection.style.display = "block";
  chooseRole.style.display = "none";
  hostSection.style.display = "none";
  viewerSection.style.display = "none";
  playerFrame.style.display = "none";
  userInfo.style.display = "none";
  userMenu.style.display = "none";
  playerFrame.src = "";
});

// ESCOLHER HOST
document.getElementById('chooseHost').addEventListener('click', async () => {
  isHost = true;
  chooseRole.style.display = "none";
  hostSection.style.display = "block";

  const codigoGerado = gerarCodigo();
  document.getElementById('codigoGerado').innerText = codigoGerado;
  codigoAtual = codigoGerado;
  playerFrame.style.display = "block";

  // 🔥 Criar a sessão no Firebase mesmo sem vídeo
  await set(ref(db, `codigos/${codigoGerado}`), {
    videoId: null,
    isPlaying: false,
    currentTime: 0,
    ownerId: auth.currentUser.uid
  });

  // Escutar atualizações
  escutarAtualizacoesHost(codigoGerado, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.videoId) carregarVideo(data.videoId);
    }
  });

  atualizarTempoPeriodicamente();
});

// ESCOLHER VIEWER
document.getElementById('chooseViewer').addEventListener('click', () => {
  isHost = false;
  chooseRole.style.display = "none";
  viewerSection.style.display = "block";
});

// HOST envia link
document.getElementById('sendLink').addEventListener('click', () => {
  const url = document.getElementById('videoUrl').value.trim();
  if (!url) return;

  enviarVideo(codigoAtual, url, auth.currentUser.uid);
  carregarVideo(url);
});

// VIEWER conecta
document.getElementById('connectBtn').addEventListener('click', () => {
  const codigo = document.getElementById('viewerCodeInput').value.trim();
  if (!codigo) return;

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

// Funções utilitárias

function carregarVideo(videoId) {
  if (!videoId) return;
  let realId = videoId;
  
  // Se for link completo, extrair o ID do YouTube
  if (videoId.includes("youtube.com") || videoId.includes("youtu.be")) {
    const match = videoId.match(/[?&]v=([^&#]*)/) || videoId.match(/youtu\.be\/([^&#]*)/);
    if (match && match[1]) {
      realId = match[1];
    }
  }

  const embedUrl = `https://www.youtube.com/embed/${realId}?enablejsapi=1`;
  playerFrame.src = embedUrl;
}

function atualizarTempoPeriodicamente() {
  setInterval(() => {
    if (isHost && playerFrame.contentWindow) {
      playerFrame.contentWindow.postMessage('{"event":"listening","id":1}', '*');
    }
  }, 2000);
}
