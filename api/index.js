// Coloque este arquivo em: /api/index.js

import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { pool, initializeDatabase } from './db/db.js';

// 2. Importar o ROTEADOR ÚNICO (da mesma pasta)
import allRoutes from './routes/routes.js';
const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar o banco de dados
(async () => {
  try {
    await initializeDatabase();
  } catch (err) {
    console.error("Erro fatal ao inicializar o banco de dados:", err);
    process.exit(1); 
  }
})();

// 3. === Registrar o Roteador ÚNICO ===
// O vercel.json manda tudo (ex: /api/person) para este arquivo.
// O Express precisa escutar no /api para funcionar.
app.use('/api', allRoutes);

// Rota "health check" (para a raiz)
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API de Currículos está no ar!' });
});
// Rota "health check" (para o /api)
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API de Currículos está no ar!' });
});


// Apenas para desenvolvimento local (npm run dev)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Servidor rodando localmente em http://localhost:${port}`);
  });
}

// === Exportar o app para a Vercel ===
export default app;