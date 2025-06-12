import { NextRequest, NextResponse } from 'next/server';

interface Client {
  userId: string;
  writer: WritableStreamDefaultWriter;
  encoder: TextEncoder;
}

const clients: Client[] = [];

export function getClientList() {
  return clients.map(client => client.userId);
}

export function broadcastToClients(userId: string, message: any) {
  const targetClients = clients.filter(client => client.userId === userId);
  targetClients.forEach(client => {
    client.writer.write(client.encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
  });
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('user-id');
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const client: Client = { userId, writer, encoder };
  clients.push(client);

  const sendEvent = (data: string) => {
    writer.write(encoder.encode(`data: ${data}\n\n`));
  };

  const interval = setInterval(() => {
    sendEvent('ping');
  }, 30000);

  request.signal.addEventListener('abort', () => {
    clearInterval(interval);
    const index = clients.indexOf(client);
    if (index !== -1) {
      clients.splice(index, 1);
    }
    writer.close();
  });

  return new NextResponse(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}