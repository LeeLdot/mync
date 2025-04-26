// Importando Firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update } from "firebase/database";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

// Configuração do Firebase
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

// Função para gerar código aleatório
function gerarCodigo() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

// Elementos da página
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
const userInfo = document.getElementById('userInfo');
const userPhoto = document.getElementById('userPhoto');
const userMenu = document.getElementById('userMenu');
const logoutBtn = document.getElementById('logoutBtn');

window.codigoHost = ""; // Código gerado depois

// Escolha de função
chooseHost.addEventListener('click', () => {
  chooseRole.style.display = "none";
  hostLoginSection.style.display = "block";
});

chooseViewer.addEventListener('click', () => {
  chooseRole.style.display = "none";
  viewerSection.style.display = "block";
  escutarAtualizacoesViewer();
});

// Login do Host
loginBtn.addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Logado como", result.user.displayName);
    })
    .catch((error) => {
      console.error(error);
    });
});

// Ação após login
onAuthStateChanged(auth, (user) => {
  if (user) {
    hostLoginSection.style.display = "none";
    hostSection.style.display = "block";

    // Mostrar foto de perfil
    userPhoto.src = user.photoURL;
    userInfo.style.display = "block";

    const codigoGerado = gerarCodigo();
    document.getElementById('codigoGerado').innerText = `Código: ${codigoGerado}`;
    window.codigoHost = codigoGerado;

    escutarAtualizacoesHost();
  }
});

// Clicar na foto do usuário abre ou fecha o menu
userPhoto.addEventListener('click', () => {
  if (userMenu.style.display === "none") {
    userMenu.style.display = "block";
  } else {
    userMenu.style.display = "none";
  }
});

// Clicar em "Sair" desloga
logoutBtn.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      window.location.reload();
    })
    .catch((error) => {
      console.error('Erro ao deslogar:', error);
    });
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

  await set(ref(db, `codigos/${window.codigoHost}`), {
    videoId: videoId,
    isPlaying: false,
    ownerId: auth.currentUser.uid
  });

  atualizarPlayerHost(videoId);
});

document.getElementById('playBtn').addEventListener('click', async () => {
  await update(ref(db, `codigos/${window.codigoHost}`), {
    isPlaying: true
  });
});

document.getElementById('pauseBtn').addEventListener('click', async () => {
  await update(ref(db, `codigos/${window.codigoHost}`), {
    isPlaying: false
  });
});

// Funções do Viewer
function escutarAtualizacoesViewer() {
  const codigoRef = ref(db, `codigos/${window.codigoHost}`);
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
  try {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([^?&"'>]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Erro ao extrair ID do vídeo:", error);
    return null;
  }
}
