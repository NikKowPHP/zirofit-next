import { createServer } from 'http';
import next from 'next';
import { setupWebSocket } from './src/lib/websocket';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const port = parseInt(process.env.PORT || '3750', 10);
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  setupWebSocket(server);

  server.listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`);

  });
});