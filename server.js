import express from 'express';
import teamRoutes from './src/routes/teams.js';
import { matchRouter } from './src/routes/matches.js';
import { initializeDatabase } from './src/db/schema.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Sports dashboard is running');
});

app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRouter);


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
      console.log(`Access the app at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
