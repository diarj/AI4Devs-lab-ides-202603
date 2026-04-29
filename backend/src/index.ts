import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

export const app = createApp();

const port = Number.parseInt(process.env.PORT || '3010', 10);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
