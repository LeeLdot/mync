// Importando Firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update } from "firebase/database";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

// Firebase Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const codigoHost = "stream";

// Elementos
const chooseRole = document.getElementById('chooseRole');
const chooseHost = document.getElementById('chooseHost');
const chooseViewer = document.getElementById('chooseViewer');

const hostLoginSection = document.getElementById('hostLoginSection');
const hostSection = document.getElementById('hostSection');
const viewerSection = document.getElementById('viewerSection');

const loginBtn = document.getElementById('loginBtn');
const playerHost = document.getElementById('playerHost');
const playerViewer = document.getElementById('playerViewer');
const viewerStatus = document.getElementById('viewerStatus');

// Escolher Host
chooseHost.addEventListener('click', () => {
  chooseRole.style.display = "none";
  hostLoginSection.style.display = "block";
});

// Escolher Viewer
chooseViewer.addEventListener('click', () => {
  chooseRole.style.display = "none";
  viewerSection.style.display = "block";
  escutarAtualizacoesViewer();
});

// Fazer login
loginBtn.addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Logado como", result.user.displayName);
    })
    .catch((error) => {
      console.error(error);
    });
});

// Quando login acontecer
onAuthStateChanged(auth, (user) => {
  if (user) {
    hostLoginSection.style.display = "none";
    hostSection.style.display = "block";
    escutarAtualizacoesHost();
  }
});

// Funções do Host
document.getElementById('sendLink').addEventListener('click', async () => {
  const videoUrl = document.getElementById('videoUrl').value.trim();
  if (!videoUrl) return;

  const videoId = extrairVideoId(videoUrl);
  if (!videoId) {
    alert("Link inválido!");
    return;
  }

  await set(ref(db, `codigos/${codigoHost}`), {
    videoId: videoId,
    isPlaying: false
  });

  atualizarPlayerHost(videoId);
});

document.getElementById('playBtn').addEventListener('click', async () => {
  await update(ref(db, `codigos/${codigoHost}`), {
    isPlaying: true
  });
});

document.getElementById('pauseBtn').addEventListener('click', async () => {
  await update(ref(db, `codigos/${codigoHost}`), {
    isPlaying: false
  });
});

// Funções do Viewer
function escutarAtualizacoesViewer() {
  const codigoRef = ref(db, `codigos/${codigoHost}`);
  onValue(codigoRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.videoId) {
        atualizarPlayerViewer(data.videoId);
      }
      if (data.isPlaying !== undefined) {
        controlarPlayerViewer(data.isPlaying);
      }
    }
  });
}

// Atualizar player do Host
function atualizarPlayerHost(videoId) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  playerHost.src = embedUrl;
}

// Atualizar player do Viewer
function atualizarPlayerViewer(videoId) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  playerViewer.src = embedUrl;
}

// Controlar player do Viewer
function controlarPlayerViewer(play) {
  const iframe = playerViewer.contentWindow;
  if (!iframe) return;

  if (play) {
    iframe.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    viewerStatus.innerText = "🎵 Tocando!";
  } else {
    iframe.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    viewerStatus.innerText = "⏸️ Pausado!";
  }
}

// Extrair ID do vídeo
function extrairVideoId(url) {
  const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
