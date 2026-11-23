import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Encaminha /api para o backend Spring Boot (porta 8080). Assim o cookie de
    // sessão do login funciona sem precisar configurar CORS.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
