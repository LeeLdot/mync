// Importar módulos Firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, remove } from "firebase/database";

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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let codigoAtivo = null;

// Função para gerar código aleatório
function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Evento de gerar código
document.getElementById('gerar').addEventListener('click', async () => {
  const codigo = gerarCodigo();
  codigoAtivo = codigo;

  await set(ref(db, 'codigos/' + codigo), {
    ativo: true,
    timestamp: Date.now()
  });

  document.getElementById('codigoHost').innerText = `Código: ${codigo}`;
});

// Evento de digitar o código
document.getElementById('codigoViewer').addEventListener('input', () => {
  const codigoDigitado = document.getElementById('codigoViewer').value;

  if (codigoDigitado.length === 6) { 
    escutarCodigo(codigoDigitado);
  }
});

// Função para escutar o código no Firebase
function escutarCodigo(codigo) {
  const codigoRef = ref(db, 'codigos/' + codigo);

  onValue(codigoRef, (snapshot) => {
    if (snapshot.exists()) {
      const dados = snapshot.val();
      
      const tempoAtual = Date.now();
      const tempoCriado = dados.timestamp || 0;
      const cincoMinutos = 5 * 60 * 1000; // 5 minutos em ms

      // Checar se está dentro do prazo de validade
      if (dados.ativo && (tempoAtual - tempoCriado) <= cincoMinutos) {
        document.getElementById('mensagem').innerText = "🎵 Você conectou!";

        // 🔥 Deletar o código depois de conectar
        remove(codigoRef);
      } else {
        document.getElementById('mensagem').innerText = "❌ Código expirado.";
        
        // Também remove o código se já expirou
        remove(codigoRef);
      }
    } else {
      document.getElementById('mensagem').innerText = "❌ Código inválido.";
    }
  }, {
    onlyOnce: true // Lê apenas uma vez
  });
}
