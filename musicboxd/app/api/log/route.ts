import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerAuthSession();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { spotifyAlbumId, listenedAt } = await req.json();

    if (!spotifyAlbumId) {
        return NextResponse.json({ error: "Missing spotifyAlbumId" }, { status: 400 });
    }

    try {
        const log = await prisma.albumLog.upsert({
            where: {
                userId_spotifyAlbumId: {
                    userId: session.user.id,
                    spotifyAlbumId,
                },
            },
            update: {
                listenedAt: listenedAt ? new Date(listenedAt) : new Date(),
            },
            create: {
                userId: session.user.id,
                spotifyAlbumId,
                listenedAt: listenedAt ? new Date(listenedAt) : new Date(),
            },
        });

        return NextResponse.json(log);
    } catch (error) {
        console.error("Error logging album:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
