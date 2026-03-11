import { NextAuthOptions, getServerSession } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { prisma } from "./prisma";

async function refreshAccessToken(token: any) {
    try {
        const url = "https://accounts.spotify.com/api/token";

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    Buffer.from(
                        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                    ).toString("base64"),
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error("Error refreshing access token", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "user-read-email user-read-private streaming",
                },
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, account, user }) {
            // Initial sign in
            if (account && user) {
                // account.providerAccountId is the Spotify user ID
                const spotifyId = account.providerAccountId;

                const dbUser = await prisma.user.upsert({
                    where: { spotifyId },
                    update: {
                        displayName: user.name,
                        avatarUrl: user.image,
                    },
                    create: {
                        spotifyId,
                        username: spotifyId, // default username to their spotify ID, can change later
                        displayName: user.name,
                        avatarUrl: user.image,
                    },
                });

                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    expiresAt: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
                    dbUserId: dbUser.id,
                };
            }

            // Return previous token if the access token has not expired yet
            if (token.expiresAt && Date.now() < (token.expiresAt as number)) {
                return token;
            }

            // Access token has expired, try to update it
            return await refreshAccessToken(token);
        },
        async session({ session, token }: any) {
            if (token) {
                session.user.id = token.dbUserId;
                session.accessToken = token.accessToken;
                session.error = token.error;
            }
            return session;
        },
    },
};

export const getServerAuthSession = () => getServerSession(authOptions);
