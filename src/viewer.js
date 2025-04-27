import { db } from "./firebaseConfig.js";
import { ref, onValue } from "firebase/database";

let player = null;
let playerReady = false;
let videoAtual = null;
let ultimoData = null;

export function configurarViewerPlayer(p) {
  player = p;
  playerReady = true;

  // 🔥 Se já tínhamos dados do Host, sincroniza agora
  if (ultimoData) {
    sincronizarComHost(ultimoData);
  }
}

export function escutarAtualizacoesViewer(codigoViewer) {
  const codigoRef = ref(db, `codigos/${codigoViewer}`);

  onValue(codigoRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const data = snapshot.val();
    ultimoData = data;

    if (!player || !playerReady) {
      return; // 🔥 Espera player carregar
    }

    sincronizarComHost(data);
  });
}

function sincronizarComHost(data) {
  if (!player || !playerReady) return;

  // Se o vídeo mudou, carrega novo vídeo
  if (data.videoId && data.videoId !== videoAtual) {
    player.loadVideoById(data.videoId);
    videoAtual = data.videoId;
    return;
  }

  // Corrige o tempo
  player.seekTo(data.currentTime, true);

  // Play ou Pause
  if (data.isPlaying) {
    player.playVideo();
  } else {
    player.pauseVideo();
  }
}
