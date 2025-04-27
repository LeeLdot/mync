import { db } from "./firebaseConfig.js";
import { ref, onValue } from "firebase/database";

export function escutarAtualizacoesViewer(codigoViewer, callback) {
  const codigoRef = ref(db, `codigos/${codigoViewer}`);
  onValue(codigoRef, callback);
}

onValue(ref(db, `codigos/${codigoAtual}`), (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.val();

    if (data.videoId) carregarVideo(data.videoId);

    if (ytPlayer) {
      if (data.isPlaying) {
        ytPlayer.playVideo();
      } else {
        ytPlayer.pauseVideo();
      }

      const viewerTime = ytPlayer.getCurrentTime();
      const diferenca = Math.abs(viewerTime - data.currentTime);

      if (diferenca > 2) {
        ytPlayer.seekTo(data.currentTime, true);
      }
    }
  }
});
