import { fazerLogin, monitorarLogin, fazerLogout } from "./auth.js";
import { gerarCodigo } from "./utils.js";
import { enviarVideo } from "./host.js";
import { auth, db } from "./firebaseConfig.js";
import { ref, set, onValue, update } from "firebase/database";

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
let playerReady = false;

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

// MENU
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

  await set(ref(db, `codigos/${codigoGerado}`), {
    videoId: null,
    isPlaying: false,
    currentTime: 0,
    ownerId: auth.currentUser.uid
  });

  monitorarEstadoHost();
});

// ESCOLHER VIEWER
document.getElementById('chooseViewer').addEventListener('click', () => {
  isHost = false;
  chooseRole.style.display = "none";
  viewerSection.style.display = "block";
});

// HOST envia vídeo
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

  onValue(ref(db, `codigos/${codigoAtual}`), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.videoId) carregarVideo(data.videoId);

      sincronizarComHost(data);
    } else {
      document.getElementById('viewerStatus').innerText = "❌ Código inválido!";
    }
  });

  document.getElementById('viewerStatus').innerText = "🎶 Conectado!";
});

// Funções

function carregarVideo(videoId) {
  if (!videoId) return;
  let realId = videoId;

  if (videoId.includes("youtube.com") || videoId.includes("youtu.be")) {
    const match = videoId.match(/[?&]v=([^&#]*)/) || videoId.match(/youtu\.be\/([^&#]*)/);
    if (match && match[1]) {
      realId = match[1];
    }
  }

  const embedUrl = `https://www.youtube.com/embed/${realId}?enablejsapi=1&autoplay=1`;
  playerFrame.src = embedUrl;

  // Quando player carregar
  playerFrame.onload = () => {
    playerReady = true;
  };
}

function monitorarEstadoHost() {
  setInterval(() => {
    if (!isHost || !playerFrame.contentWindow) return;

    playerFrame.contentWindow.postMessage('{"event":"listening","id":1}', '*');

    window.addEventListener('message', (event) => {
      if (event.data && event.data.info) {
        const { playerState, currentTime } = event.data.info;

        if (playerState !== undefined && currentTime !== undefined) {
          const updates = {
            currentTime: currentTime,
            isPlaying: playerState === 1 // 1 = Playing
          };

          update(ref(db, `codigos/${codigoAtual}`), updates);
        }
      }
    }, { once: true });
  }, 2000);
}

function sincronizarComHost(data) {
  if (!playerReady) return;

  const iframe = playerFrame.contentWindow;
  if (!iframe) return;

  if (data.isPlaying) {
    iframe.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
  } else {
    iframe.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }

  // Sincronizar tempo se diferença > 2s
  iframe.postMessage('{"event":"listening","id":1}', '*');

  window.addEventListener('message', (event) => {
    if (event.data && event.data.info && event.data.info.currentTime !== undefined) {
      const viewerTime = event.data.info.currentTime;
      const diferenca = Math.abs(viewerTime - data.currentTime);

      if (diferenca > 2) {
        iframe.postMessage(`{"event":"command","func":"seekTo","args":[${data.currentTime}, true]}`, '*');
      }
    }
  }, { once: true });
}

let ytPlayer = null;

window.onYouTubeIframeAPIReady = () => {
  ytPlayer = new YT.Player('playerFrame', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
};

function onPlayerReady(event) {
  console.log("YouTube Player Pronto!");
}

function onPlayerStateChange(event) {
  if (!isHost) return;

  const playerState = event.data;
  const currentTime = ytPlayer.getCurrentTime();

  // Atualizar o estado no Firebase
  update(ref(db, `codigos/${codigoAtual}`), {
    isPlaying: playerState === YT.PlayerState.PLAYING,
    currentTime: currentTime
  });
}
