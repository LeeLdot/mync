import { db } from "./firebaseConfig.js";
import { ref, onValue } from "firebase/database";

let player = null;
let playerReady = false;
let ultimoTempoHost = 0;
let videoAtual = null; // <- novo controle de qual vídeo está no player

export function configurarViewerPlayer(p) {
  player = p;
  playerReady = true;
}

export function escutarAtualizacoesViewer(codigoViewer) {
  const codigoRef = ref(db, `codigos/${codigoViewer}`);

  window.addEventListener('message', (event) => {
    if (!event.data || !event.data.info) return;

    const viewerTime = event.data.info.currentTime;
    const diferenca = Math.abs(viewerTime - ultimoTempoHost);

    if (diferenca > 2) {
      player.contentWindow.postMessage(`{"event":"command","func":"seekTo","args":[${ultimoTempoHost}, true]}`, '*');
    }
  });

  onValue(codigoRef, (snapshot) => {
    if (!snapshot.exists()) return;
    if (!player || !playerReady) return;

    const data = snapshot.val();
    ultimoTempoHost = data.currentTime;

    // 👇 Novo: Se o vídeo mudar, carregar o novo
    if (data.videoId && data.videoId !== videoAtual) {
      const embedUrl = `https://www.youtube.com/embed/${data.videoId}?enablejsapi=1&autoplay=1`;
      player.src = embedUrl;
      videoAtual = data.videoId;
    }

    // Play/Pause conforme o Host
    if (data.isPlaying) {
      player.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    } else {
      player.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    }
  });
}
