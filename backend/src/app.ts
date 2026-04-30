import cors from 'cors';
import express from 'express';
import candidateRoutes from './routes/candidateRoutes';
import { errorHandler } from './presentation/middleware/errorHandler';

export function createApp(): express.Express {
  const app = express();

  const corsOptions: cors.CorsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  };
  app.use(cors(corsOptions));

  app.use(express.json());

  app.get('/', (_req, res) => {
    res.type('text/plain').send('Welcome to LTI API');
  });

  app.use('/api/candidates', candidateRoutes);

  app.use(errorHandler);

  return app;
}
