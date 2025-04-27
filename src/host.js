//host.js
import { ref, update } from "firebase/database";
import { db } from "./firebaseConfig.js";

export function enviarVideo(codigo, url, userId) {
  let realId = url;

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const match = url.match(/[?&]v=([^&#]*)/) || url.match(/youtu\.be\/([^&#]*)/);
    if (match && match[1]) {
      realId = match[1];
    }
  }

  const updates = {
    videoId: realId,
    isPlaying: false,
    currentTime: 0,
    ownerId: userId
  };

  update(ref(db, `codigos/${codigo}`), updates);
}
