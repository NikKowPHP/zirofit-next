import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 },
      );
    }

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: user.id, // Ensure the notification belongs to the user
      },
      data: {
        readStatus: true,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("[NOTIFICATIONS_MARK_READ_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
