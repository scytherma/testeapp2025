import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Importar rotas
import authRoutes from './routes/auth.js';
import marketResearchRoutes from './routes/marketResearch.js';
import connectionsRoutes from './routes/connections.js';
import calculatorsRoutes from './routes/calculators.js';
import userRoutes from './routes/users.js';
import savedAdsRoutes from './routes/savedAds.js';

// Importar middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela de tempo
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL, // Permitir apenas a origem do frontend configurada no .env
  credentials: true
}));
app.use(limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos do frontend
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/pesquisa-mercado', authenticateToken, marketResearchRoutes);
app.use('/api/conexao-lojas', authenticateToken, connectionsRoutes);
app.use('/api/calculadoras', authenticateToken, calculatorsRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/anuncios-salvos', authenticateToken, savedAdsRoutes);

// Servir index.html para todas as outras rotas (SPA)
app.use((req, res, next) => {
  // Se for uma rota de API, passar para o próximo middleware (404)
  if (req.originalUrl.startsWith('/api/')) {
    return next();
  }
  // Caso contrário, servir o index.html
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Rota 404 para APIs não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
