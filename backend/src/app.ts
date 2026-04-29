import express from 'express';
import candidateRoutes from './routes/candidateRoutes';
import { errorHandler } from './presentation/middleware/errorHandler';

export function createApp(): express.Express {
  const app = express();

  app.use(express.json());

  app.get('/', (_req, res) => {
    res.type('text/plain').send('Welcome to LTI API');
  });

  app.use('/api/candidates', candidateRoutes);

  app.use(errorHandler);

  return app;
}
