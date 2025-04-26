import { fazerLogin, monitorarLogin, fazerLogout } from "./auth.js";
import { gerarCodigo } from "./utils.js";
import { enviarVideo, escutarAtualizacoesHost, atualizarTempo, playVideo, pauseVideo } from "./host.js";
import { escutarAtualizacoesViewer } from "./viewer.js";
import { auth } from "./firebaseConfig.js";

const loginSection = document.getElementById('loginSection');
const chooseRole = document.getElementById('chooseRole');
const chooseHost = document.getElementById('chooseHost');
const chooseViewer = document.getElementById('chooseViewer');
const hostSection = document.getElementById('hostSection');
const viewerSection = document.getElementById('viewerSection');

const loginBtn = document.getElementById('loginBtn');
const userInfo = document.getElementById('userInfo');
const userPhoto = document.getElementById('userPhoto');
const userMenu = document.getElementById('userMenu');
const logoutBtn = document.getElementById('logoutBtn');

const playerHost = document.getElementById('playerHost');
const playerViewer = document.getElementById('playerViewer');
const viewerStatus = document.getElementById('viewerStatus');
const viewerCodeInput = document.getElementById('viewerCodeInput');
const connectBtn = document.getElementById('connectBtn');
const viewerPlayerBox = document.getElementById('viewerPlayerBox');

window.codigoHost = "";
let isHost = false;

loginBtn.addEventListener('click', async () => {
  try {
    await fazerLogin();
    console.log("Login realizado com sucesso!");
  } catch (error) {
    console.error("Erro ao logar:", error);
  }
});

monitorarLogin((user) => {
  if (user) {
    loginSection.style.display = "none";
    chooseRole.style.display = "block";

    userPhoto.src = user.photoURL;
    userInfo.style.display = "block";
  } else {
    chooseRole.style.display = "none";
    hostSection.style.display = "none";
    viewerSection.style.display = "none";
    loginSection.style.display = "block";
  }
});

chooseHost.addEventListener('click', () => {
  chooseRole.style.display = "none";
  hostSection.style.display = "block";

  isHost = true;

  const codigoGerado = gerarCodigo();
  document.getElementById('codigoGerado').innerText = `Código: ${codigoGerado}`;
  window.codigoHost = codigoGerado;

  escutarAtualizacoesHost(codigoGerado, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.videoId) atualizarPlayerHost(data.videoId);
    }
  });

  iniciarMonitoramentoHost();
});

chooseViewer.addEventListener('click', () => {
  chooseRole.style.display = "none";
  viewerSection.style.display = "block";
});

userPhoto.addEventListener('click', () => {
  userMenu.style.display = userMenu.style.display === "none" ? "block" : "none";
});

logoutBtn.addEventListener('click', () => {
  fazerLogout().then(() => window.location.reload());
});

document.getElementById('sendLink').addEventListener('click', () => {
  const videoUrl = document.getElementById('videoUrl').value.trim();
  if (!videoUrl) return;

  enviarVideo(window.codigoHost, videoUrl, auth.currentUser.uid)
    .then(() => atualizarPlayerHost(videoUrl));
});

connectBtn.addEventListener('click', () => {
  const codigo = viewerCodeInput.value.trim().toUpperCase();
  if (!codigo) {
    viewerStatus.innerText = "Digite o código.";
    return;
  }
  escutarAtualizacoesViewer(codigo, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.videoId) {
        atualizarPlayerViewer(data.videoId);
        viewerPlayerBox.style.display = "block";
      }
      if (data.isPlaying !== undefined) controlarPlayerViewer(data.isPlaying);
      if (data.currentTime !== undefined) sincronizarTempoViewer(data.currentTime);
      viewerStatus.innerText = "🎶 Conectado!";
    } else {
      viewerStatus.innerText = "❌ Código inválido!";
    }
  });
});

function atualizarPlayerHost(videoId) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=1`;
  playerHost.src = embedUrl;
}

function atualizarPlayerViewer(videoId) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0`;
  playerViewer.src = embedUrl;
}

function controlarPlayerViewer(play) {
  const iframe = playerViewer.contentWindow;
  if (!iframe) return;
  iframe.postMessage(`{"event":"command","func":"${play ? 'playVideo' : 'pauseVideo'}","args":""}`, '*');
}

function sincronizarTempoViewer(hostTime) {
  const iframe = playerViewer.contentWindow;
  if (!iframe) return;

  iframe.postMessage('{"event":"listening","id":1}', '*');
  window.addEventListener('message', (event) => {
    if (event.data && event.data.info && event.data.info.currentTime !== undefined) {
      const viewerTime = event.data.info.currentTime;
      const diferenca = Math.abs(viewerTime - hostTime);

      if (diferenca > 2) {
        iframe.postMessage(`{"event":"command","func":"seekTo","args":[${hostTime}, true]}`, '*');
      }
    }
  }, { once: true });
}

function iniciarMonitoramentoHost() {
  setInterval(() => {
    if (!isHost || !playerHost.contentWindow) return;

    playerHost.contentWindow.postMessage('{"event":"listening","id":1}', '*');
    window.addEventListener('message', (event) => {
      if (event.data && event.data.info) {
        const { currentTime, playerState } = event.data.info;

        if (currentTime !== undefined) {
          atualizarTempo(window.codigoHost, currentTime);
        }

        if (playerState !== undefined) {
          if (playerState === 1) { // Playing
            playVideo(window.codigoHost);
          } else if (playerState === 2) { // Paused
            pauseVideo(window.codigoHost);
          }
        }
      }
    }, { once: true });
  }, 2000); // A cada 2 segundos
}
