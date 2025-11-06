import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// Importar o inicializador do banco
import { pool, initializeDatabase } from './db/db.js';

// Importar Roteadores da pasta /routes
import personRoutes from './routes/pessoa.js';
import experienceRoutes from './routes/experiencia.js';
import educationRoutes from './routes/educacao.js';
import skillRoutes from './routes/habilidade.js';

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar o banco de dados (criar tabelas e popular)
// Usamos uma IIFE (Immediately Invoked Function Expression) async
(async () => {
  try {
    await initializeDatabase();
  } catch (err) {
    console.error("Erro fatal ao inicializar o banco de dados:", err);
    process.exit(1); // Em caso de falha no DB, é melhor parar o app
  }
})();

// === Registrar os Roteadores ===
// O Express precisa escutar no /api, pois o vercel.json passa o caminho completo.
app.use('/api', personRoutes);
app.use('/api', experienceRoutes);
app.use('/api', educationRoutes);
app.use('/api', skillRoutes);

// Rota "health check"
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API de Currículos está no ar!' });
});

// Apenas para desenvolvimento local (npm run dev)
// A Vercel ignora este bloco e usa o 'export default'
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Servidor rodando localmente em http://localhost:${port}`);
  });
}

// === Exportar o app para a Vercel ===
// É assim que o 'api/index.js' consegue importar o app
export default app;