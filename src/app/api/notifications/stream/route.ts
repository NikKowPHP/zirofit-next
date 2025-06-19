// This file is no longer used after migrating from real-time notifications (SSE)
// to the default Next.js server with API polling.

import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ message: "This endpoint is deprecated." }, { status: 410 });
}