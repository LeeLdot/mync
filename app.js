// Configurações do Firebase (coloque suas credenciais aqui)
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    databaseURL: "SEU_DATABASE_URL",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
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
        document.getElementById('mensagem').innerText = "🌸 Você conectou!";
      } else {
        document.getElementById('mensagem').innerText = "❌ Código inválido ou expirado.";
      }
    });
  }
  