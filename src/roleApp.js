import { gerarCodigo } from "./utils.js";
import { auth, db } from "./firebaseConfig.js";
import { ref, set } from "firebase/database";

document.getElementById('chooseHost').addEventListener('click', async () => {
  const codigo = gerarCodigo();

  // 🔥 Cria a entrada da sala já
  await set(ref(db, `codigos/${codigo}`), {
    videoId: null,
    isPlaying: false,
    currentTime: 0,
    ownerId: auth.currentUser.uid
  });

  // 🔥 Salva o código no sessionStorage
  sessionStorage.setItem('codigoAtual', codigo);

  window.location.href = "/host.html";
});

document.getElementById('chooseViewer').addEventListener('click', () => {
  window.location.href = "/viewer.html";
});
