import { db } from "./firebaseConfig.js";
import { ref, onValue } from "firebase/database";

let player = null;
let playerReady = false;
let videoAtual = null;

export function configurarViewerPlayer(p) {
  player = p;
  playerReady = true;
}

export function escutarAtualizacoesViewer(codigoViewer) {
  const codigoRef = ref(db, `codigos/${codigoViewer}`);

  onValue(codigoRef, (snapshot) => {
    if (!snapshot.exists()) return;
    if (!player || !playerReady) return;

    const data = snapshot.val();

    // Se mudou o vídeo
    if (data.videoId && data.videoId !== videoAtual) {
      const embedUrl = `https://www.youtube.com/embed/${data.videoId}?enablejsapi=1&autoplay=1`;
      player.src = embedUrl;
      videoAtual = data.videoId;
      return;
    }

    // 🔥 Ajustar o tempo sempre
    player.contentWindow.postMessage(`{"event":"command","func":"seekTo","args":[${data.currentTime}, true]}`, '*');

    // 🔥 Depois play/pause
    if (data.isPlaying) {
      player.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    } else {
      player.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    }
  });
}
