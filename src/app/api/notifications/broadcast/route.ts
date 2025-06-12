import { NextResponse } from 'next/server';
import { getClientList, broadcastToClients } from '../stream/route';

export async function POST(request: Request) {
  const { userId } = await request.json();
  const clients = getClientList();
  
  if (clients.length > 0) {
    broadcastToClients(userId, { type: 'new-notification' });
  }

  return NextResponse.json({ success: true });
}