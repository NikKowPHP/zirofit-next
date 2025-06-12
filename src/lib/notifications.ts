export interface Client {
  userId: string;
  writer: WritableStreamDefaultWriter;
  encoder: TextEncoder;
}

export const clients: Client[] = [];

export function getClientList() {
  return clients.map(client => client.userId);
}

export function broadcastToClients(userId: string, message: any) {
  const targetClients = clients.filter(client => client.userId === userId);
  targetClients.forEach(client => {
    client.writer.write(client.encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
  });
}