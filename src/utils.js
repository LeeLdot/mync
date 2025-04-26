export function gerarCodigo() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  }
  
  export function extrairVideoId(url) {
    try {
      const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([^?&"'>]+)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      console.error("Erro ao extrair ID do vídeo:", error);
      return null;
    }
  }
  