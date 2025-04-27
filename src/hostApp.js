import { fazerLogout } from "./auth.js";
import { gerarCodigo } from "./utils.js";
import { enviarVideo } from "./host.js";
import { auth, db } from "./firebaseConfig.js";
import { ref, set, update } from "firebase/database";

const logoutBtn = document.getElementById('logoutBtn');
const sendLinkBtn = document.getElementById('sendLink');
const playerFrame = document.getElementById('playerFrame');
const codigoGeradoSpan = document.getElementById('codigoGerado');
const videoUrlInput = document.getElementById('videoUrl');

let codigoAtual = "";
let ytPlayer = null;

// Função principal para iniciar o Host
async function iniciarHost() {
  const codigo = gerarCodigo();
  codigoAtual = codigo;
  codigoGeradoSpan.innerText = codigo;

  // Cria a sala no Firebase imediatamente
  await set(ref(db, `codigos/${codigoAtual}`), {
    videoId: null,
    isPlaying: false,
    currentTime: 0,
    ownerId: auth.currentUser.uid
  });
}

// Botão logout
logoutBtn.addEventListener('click', async () => {
  await fazerLogout();
  window.location.href = "/login.html";
});

// Botão enviar link
sendLinkBtn.addEventListener('click', () => {
  const url = videoUrlInput.value.trim();
  if (!url) return;

  enviarVideo(codigoAtual, url, auth.currentUser.uid);
  carregarVideo(url);
});

// Carregar o vídeo no player
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

  // Esperar o iframe carregar para inicializar YT.Player
  playerFrame.onload = () => {
    iniciarYouTubePlayer();
  };
}

// Inicializar YT.Player no iframe
function iniciarYouTubePlayer() {
  ytPlayer = new YT.Player('playerFrame', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// Quando o player do YouTube estiver pronto
function onPlayerReady() {
  console.log("YouTube Player pronto!");
  monitorarEstadoHost();
}

// Monitorar estado do player do Host
function monitorarEstadoHost() {
  setInterval(() => {
    if (!ytPlayer) return;

    const estado = ytPlayer.getPlayerState();
    const tempo = ytPlayer.getCurrentTime();

    update(ref(db, `codigos/${codigoAtual}`), {
      isPlaying: estado === YT.PlayerState.PLAYING,
      currentTime: tempo
    });
  }, 2000);
}

// Quando o estado do player mudar
function onPlayerStateChange(event) {
  const playerState = event.data;
  const currentTime = ytPlayer.getCurrentTime();

  update(ref(db, `codigos/${codigoAtual}`), {
    isPlaying: playerState === YT.PlayerState.PLAYING,
    currentTime: currentTime
  });
}

// Começar o fluxo ao carregar a página
iniciarHost();
