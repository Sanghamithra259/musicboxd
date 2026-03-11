import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerAuthSession();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { spotifyAlbumId, body, containsSpoilers } = await req.json();

    if (!spotifyAlbumId || !body) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: session.user.id,
                spotifyAlbumId,
            },
        });

        if (existingReview) {
            const review = await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    body,
                    containsSpoilers: Boolean(containsSpoilers),
                },
            });
            return NextResponse.json(review);
        } else {
            const review = await prisma.review.create({
                data: {
                    userId: session.user.id,
                    spotifyAlbumId,
                    body,
                    containsSpoilers: Boolean(containsSpoilers),
                },
            });
            return NextResponse.json(review);
        }
    } catch (error) {
        console.error("Error saving review:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
