import { fazerLogout } from "./auth.js";
import { enviarVideo } from "./host.js";
import { auth } from "./firebaseConfig.js"; // 🔥 Adicionado para enviar corretamente
import { ref, update } from "firebase/database";
import { db } from "./firebaseConfig.js";

const logoutBtn = document.getElementById('logoutBtn');
const sendLinkBtn = document.getElementById('sendLink');
const playerArea = document.getElementById('playerArea');
const codigoGeradoSpan = document.getElementById('codigoGerado');
const videoUrlInput = document.getElementById('videoUrl');

let codigoAtual = sessionStorage.getItem('codigoAtual');
let ytPlayer = null;

// 🔥 Se não tem código salvo, volta pro role.html
if (!codigoAtual) {
  window.location.href = "/role.html";
}

// Exibe o código gerado na tela
codigoGeradoSpan.innerText = codigoAtual;

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

// Carrega o vídeo no iframe
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

  const iframe = document.createElement('iframe');
  iframe.id = "playerFrame";
  iframe.frameBorder = "0";
  iframe.allow = "autoplay; fullscreen";
  iframe.allowTransparency = "true";
  iframe.style.width = "100%";
  iframe.style.height = "400px";
  iframe.src = embedUrl;

  playerArea.innerHTML = "";
  playerArea.appendChild(iframe);

  setTimeout(() => {
    ytPlayer = new YT.Player('playerFrame', {
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  }, 300);
}

// Quando o player estiver pronto
function onPlayerReady() {
  console.log("YouTube Player pronto!");
}

// Quando mudar o estado do player (play/pause)
function onPlayerStateChange(event) {
  if (!ytPlayer) return;

  const estado = event.data;
  const tempo = ytPlayer.getCurrentTime();

  update(ref(db, `codigos/${codigoAtual}`), {
    isPlaying: estado === YT.PlayerState.PLAYING,
    currentTime: tempo
  });
}
