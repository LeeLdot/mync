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
      player.loadVideoById(data.videoId); // 🛠️ YouTube API verdadeira
      videoAtual = data.videoId;
      return;
    }

    // 🔥 Corrige tempo
    player.seekTo(data.currentTime, true);

    // 🔥 Controle de play/pause
    if (data.isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  });
}
