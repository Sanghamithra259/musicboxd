import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerAuthSession();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { spotifyAlbumId, score } = await req.json();

    if (!spotifyAlbumId || score === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const rating = await prisma.rating.upsert({
            where: {
                userId_spotifyAlbumId: {
                    userId: session.user.id,
                    spotifyAlbumId,
                },
            },
            update: {
                score: parseFloat(score),
            },
            create: {
                userId: session.user.id,
                spotifyAlbumId,
                score: parseFloat(score),
            },
        });

        return NextResponse.json(rating);
    } catch (error) {
        console.error("Error rating album:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
