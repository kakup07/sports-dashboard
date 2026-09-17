import express from 'express';
import teamRoutes from './src/routes/teams.js';
import { matchRouter } from './src/routes/matches.js';
import http from 'http';
import { attachWebSocketServer } from './src/ws/server.js';
import {initializeDatabase} from './src/db/schema.js'

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0'

const app = express();
const server = http.createServer(app)

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Sports dashboard is running');
});

app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server)
app.locals.broadcastMatchCreated = broadcastMatchCreated

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await initializeDatabase()
    const baseUrl = `http://${HOST}:${PORT}`
    server.listen(PORT, HOST, () => {
      console.log(`Server started at ${baseUrl}`);
      console.log(`Websocket server started at ${baseUrl.replace('http', 'ws')}/ws`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
