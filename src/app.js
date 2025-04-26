import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

// Configurações do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializando Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let codigoAtivo = null;

// Função gerar código
function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Evento gerar código
document.getElementById('gerar').addEventListener('click', async () => {
  const codigo = gerarCodigo();
  codigoAtivo = codigo;

  await set(ref(db, 'codigos/' + codigo), {
    ativo: true,
    timestamp: Date.now()
  });

  document.getElementById('codigoHost').innerText = `Código: ${codigo}`;
});

// Evento código conectar
document.getElementById('codigoViewer').addEventListener('input', () => {
  const codigoDigitado = document.getElementById('codigoViewer').value;

  if (codigoDigitado.length === 6) { // Quando completar 6 dígitos
    escutarCodigo(codigoDigitado);
  }
});

// Função escutar código Firebase
function escutarCodigo(codigo) {
  const codigoRef = ref(db, 'codigos/' + codigo);

  onValue(codigoRef, (snapshot) => {
    if (snapshot.exists() && snapshot.val().ativo) {
      document.getElementById('mensagem').innerText = "🎵 Você conectou!";
    } else {
      document.getElementById('mensagem').innerText = "❌ Código inválido ou expirado.";
    }
  });
}
