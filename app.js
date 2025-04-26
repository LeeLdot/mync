// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBR-mKcMu-iSVRSxeC0JtEPeNdBMpBZTo8",
  authDomain: "streammync.firebaseapp.com",
  databaseURL: "https://streammync-default-rtdb.firebaseio.com",
  projectId: "streammync",
  storageBucket: "streammync.firebasestorage.app",
  messagingSenderId: "596268608488",
  appId: "1:596268608488:web:bac729bb50343c9020925d"
};
  
  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  let codigoAtivo = null;
  
  // Gerar código aleatório
  function gerarCodigo() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // Evento de gerar código
  document.getElementById('gerar').addEventListener('click', async () => {
    const codigo = gerarCodigo();
    codigoAtivo = codigo;
  
    await db.ref('codigos/' + codigo).set({
      ativo: true,
      timestamp: Date.now()
    });
  
    document.getElementById('codigoHost').innerText = `Código: ${codigo}`;
  });
  
  // Escutar mudanças no input
  document.getElementById('codigoViewer').addEventListener('input', () => {
    const codigoDigitado = document.getElementById('codigoViewer').value;
  
    if (codigoDigitado.length === 6) { // quando tiver 6 dígitos
      escutarCodigo(codigoDigitado);
    }
  });
  
  // Função para escutar em tempo real
  function escutarCodigo(codigo) {
    const ref = db.ref('codigos/' + codigo);
  
    ref.on('value', (snapshot) => {
      if (snapshot.exists() && snapshot.val().ativo) {
        document.getElementById('mensagem').innerText = "🎵 Você conectou!";
      } else {
        document.getElementById('mensagem').innerText = "❌ Código inválido ou expirado.";
      }
    });
  }
  