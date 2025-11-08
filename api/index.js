import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/db.js';
import allRoutes from './routes.js'; 

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API de Currículos está no ar!');
});

app.use('/api', allRoutes);

const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Banco de dados inicializado.');

    if (process.env.NODE_ENV !== 'production') {
      app.listen(port, () => {
        console.log(`Servidor rodando localmente em http://localhost:${port}`);
      });
    }
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;