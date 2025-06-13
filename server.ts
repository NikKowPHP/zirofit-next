import { createServer } from 'http';
import next from 'next';
import { setupWebSocket } from './src/lib/websocket';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  setupWebSocket(server);

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});