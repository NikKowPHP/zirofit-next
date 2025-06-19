import { WebSocket } from 'ws';
import type { Notification } from '../types/notifications';

interface ActiveConnection {
  userId: string;
  ws: WebSocket;
}

const activeConnections: ActiveConnection[] = [];

export function broadcastNotification(userId: string, notification: Notification) {
  const connections = activeConnections.filter(conn => conn.userId === userId);
  connections.forEach(conn => {
    if (conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(JSON.stringify({ type: 'notification', data: notification }));
    }
  });
}
