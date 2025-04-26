import { db } from "./firebaseConfig.js";
import { ref, set, update, onValue } from "firebase/database";
import { extrairVideoId } from "./utils.js";

export function enviarVideo(codigoHost, url, uid) {
  const videoId = extrairVideoId(url);
  return set(ref(db, `codigos/${codigoHost}`), {
    videoId,
    isPlaying: false,
    currentTime: 0,
    ownerId: uid
  });
}

export function playVideo(codigoHost) {
  return update(ref(db, `codigos/${codigoHost}`), { isPlaying: true });
}

export function pauseVideo(codigoHost) {
  return update(ref(db, `codigos/${codigoHost}`), { isPlaying: false });
}

export function atualizarTempo(codigoHost, time) {
  return update(ref(db, `codigos/${codigoHost}`), { currentTime: time });
}

export function escutarAtualizacoesHost(codigoHost, callback) {
  const codigoRef = ref(db, `codigos/${codigoHost}`);
  onValue(codigoRef, callback);
}
