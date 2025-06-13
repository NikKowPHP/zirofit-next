import { WebSocketServer } from 'ws';
import { Server } from 'http';
import type { Notification } from '@/types/notifications';

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

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log(`WebSocket server running on ws://localhost:${(server.address() as any).port}`);
  return wss;
}

export function broadcastNotification(userId: string, notification: Notification) {
  const connections = activeConnections.filter(conn => conn.userId === userId);
  connections.forEach(conn => {
    try {
      conn.ws.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  });
}