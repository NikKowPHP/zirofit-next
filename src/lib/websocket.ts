import { WebSocketServer } from 'ws';
import { Server } from 'http';

interface ActiveConnection {
  userId: string;
  ws: any;
}

const activeConnections: ActiveConnection[] = [];

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const userId = req.headers['user-id'] as string;
    if (!userId) {
      ws.close();
      return;
    }

    const connection: ActiveConnection = { userId, ws };
    activeConnections.push(connection);

    ws.on('close', () => {
      const index = activeConnections.findIndex(conn => conn.ws === ws);
      if (index !== -1) {
        activeConnections.splice(index, 1);
      }
    });
  });

  return wss;
}

export function broadcastToUser(userId: string, message: any) {
  const connections = activeConnections.filter(conn => conn.userId === userId);
  connections.forEach(conn => {
    conn.ws.send(JSON.stringify(message));
  });
}