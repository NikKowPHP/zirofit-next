import { createServer } from 'http';
import next from 'next';
import { WebSocketServer } from 'ws';
import { parse } from 'url';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const port = parseInt(process.env.PORT || '3750', 10);
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Create the WebSocket server without attaching it to the HTTP server
  const wss = new WebSocketServer({ noServer: true });

  // Handle our application's WebSocket connections
  wss.on('connection', (ws, _req) => {
    // Your existing connection logic can go here if needed,
    // for now we can keep it simple as the client drives the logic.
    console.log('Client connected to application WebSocket');

    ws.on('close', () => {
      console.log('Client disconnected from application WebSocket');
    });
  });

  // Handle HTTP -> WebSocket upgrade requests
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url!, true);

    // Route requests for '/ws' to our application's WebSocket server
    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
