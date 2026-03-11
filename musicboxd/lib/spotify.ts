// Types representing our internal standardized format
export interface Track {
    id: string;
    name: string;
    trackNumber: number;
    durationMs: number;
    previewUrl: string | null;
}

export interface Album {
    id: string;
    name: string;
    artists: string[];
    coverArt: string;
    releaseYear: string;
    label: string | null;
    genres: string[];
    totalTracks: number;
    spotifyUrl: string;
}

// Helpers
const handleSpotifyResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 401) {
            console.error("Spotify API error: Unauthorized (bad token)");
        } else if (response.status === 429) {
            console.error("Spotify API error: Rate Limit Exceeded");
        } else {
            console.error(`Spotify API error: ${response.status} ${response.statusText}`);
        }
        return null;
    }
    return response.json();
};

const extractYear = (dateString: string) => {
    if (!dateString) return "";
    return dateString.substring(0, 4);
};

const extractArtists = (artistsArray: any[]) => {
    if (!artistsArray || !Array.isArray(artistsArray)) return [];
    return artistsArray.map((artist) => artist.name);
};

const extractCoverArt = (imagesArray: any[]) => {
    if (!imagesArray || !imagesArray.length) return "";
    // Return largest available image
    return imagesArray[0].url;
};

// Map Spotify's raw format to our unified interface
const mapSpotifyAlbumToInternal = (item: any): Album => {
    return {
        id: item.id,
        name: item.name,
        artists: extractArtists(item.artists),
        coverArt: extractCoverArt(item.images),
        releaseYear: extractYear(item.release_date),
        label: item.label || null,
        genres: item.genres || [],
        totalTracks: item.total_tracks,
        spotifyUrl: item.external_urls?.spotify || "",
    };
};

/**
 * Get a single album by Spotify ID.
 * Expects a valid user or app accessToken.
 */
export async function getAlbum(id: string, accessToken: string): Promise<Album | null> {
    if (!id || !accessToken) return null;

    try {
        const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await handleSpotifyResponse(res);
        if (!data) return null;

        return mapSpotifyAlbumToInternal(data);
    } catch (error) {
        console.error("Error fetching album from Spotify:", error);
        return null;
    }
}

/**
 * Searches Spotify for albums based on the text query.
 * Limits the return to 10 mapped Album results.
 */
export async function searchAlbums(query: string, accessToken: string): Promise<Album[]> {
    if (!query || !accessToken) return [];

    try {
        const encodedQuery = encodeURIComponent(query);
        const res = await fetch(`https://api.spotify.com/v1/search?q=${encodedQuery}&type=album&limit=10`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await handleSpotifyResponse(res);
        if (!data || !data.albums || !data.albums.items) return [];

        return data.albums.items.map(mapSpotifyAlbumToInternal);
    } catch (error) {
        console.error("Error searching Spotify albums:", error);
        return [];
    }
}

/**
 * Get an array of tracks for a particular album ID.
 */
export async function getAlbumTracks(id: string, accessToken: string): Promise<Track[]> {
    if (!id || !accessToken) return [];

    try {
        const res = await fetch(`https://api.spotify.com/v1/albums/${id}/tracks?limit=50`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await handleSpotifyResponse(res);
        if (!data || !data.items) return [];

        return data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            trackNumber: item.track_number,
            durationMs: item.duration_ms,
            previewUrl: item.preview_url,
        }));
    } catch (error) {
        console.error("Error fetching album tracks:", error);
        return [];
    }
}

/**
 * Get multiple albums by ID.
 * Automatically chunks requests to respect Spotify's max 20-items-per-request limit.
 */
export async function getMultipleAlbums(ids: string[], accessToken: string): Promise<Album[]> {
    if (!ids || !ids.length || !accessToken) return [];

    const BATCH_SIZE = 20;
    const uniqueIds = Array.from(new Set(ids)).filter(Boolean); // Sanitize inputs

    if (uniqueIds.length === 0) return [];

    let results: Album[] = [];

    try {
        // Process in batches
        for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
            const batchIds = uniqueIds.slice(i, i + BATCH_SIZE);
            const idsParam = batchIds.join(',');

            const res = await fetch(`https://api.spotify.com/v1/albums?ids=${idsParam}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const data = await handleSpotifyResponse(res);

            if (data && data.albums) {
                // null filters are needed since spotify will return null within the array for an invalid ID
                const batchAlbums = data.albums
                    .filter((album: any) => album !== null)
                    .map(mapSpotifyAlbumToInternal);

                results = [...results, ...batchAlbums];
            }
        }

        return results;
    } catch (error) {
        console.error("Error fetching multiple albums from Spotify:", error);
        return results; // Return whatever partial data we managed to grab
    }
}

/**
 * Gets a generic App token using Client Credentials to view public albums
 * when a user is not logged in.
 */
export async function getAppAccessToken(): Promise<string | null> {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    try {
        const res = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
            },
            body: new URLSearchParams({ grant_type: "client_credentials" }),
            next: { revalidate: 3500 }, // Cache the token for just under 1 hour
        });
        const data = await res.json();
        return data.access_token;
    } catch (error) {
        console.error("Error fetching Spotify App token", error);
        return null;
    }
}
