import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { searchAlbums } from "@/lib/spotify";

export async function GET(request: NextRequest) {
    try {
        const sessionUrl = new URL(request.url);
        const query = sessionUrl.searchParams.get("q");

        if (!query) {
            return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
        }

        const session = await getServerAuthSession();

        if (!session || !session.accessToken) {
            return NextResponse.json(
                { error: "Unauthorized. Please log in with Spotify first." },
                { status: 401 }
            );
        }

        // Call our typed spotify Client 
        const results = await searchAlbums(query, session.accessToken as string);

        return NextResponse.json(results);
    } catch (error) {
        console.error("Error in Search Endpoint:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
