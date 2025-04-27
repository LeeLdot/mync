import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Raiz do projeto é o próprio diretório
  server: {
    port: 5173, // Porta padrão do Vite (pode mudar se quiser)
    open: '/login.html', // Quando rodar `npm run dev`, abrir o login.html
  },
  build: {
    outDir: 'dist', // Pasta onde os arquivos de build vão
    emptyOutDir: true, // Limpa antes de buildar
  },
});
