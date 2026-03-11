import { getServerAuthSession } from "@/lib/auth";
import { getAlbum, getAlbumTracks, getAppAccessToken } from "@/lib/spotify";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { ActionBar } from "@/components/album/ActionBar";
import { notFound } from "next/navigation";
import { RatingWidget } from "@/components/ui/RatingWidget";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { Tracklist } from "@/components/album/Tracklist";
import { RatingBarChart } from "@/components/album/RatingBarChart";

interface AlbumPageProps {
    params: { id: string };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
    const session = await getServerAuthSession();

    // Decide which token to use (User or App fallback)
    const token = session?.accessToken || await getAppAccessToken();
    if (!token) {
        return <div className="p-24 text-center">Error: Unable to authenticate with Spotify API</div>;
    }

    // 1. Fetch Spotify Data (Parallel)
    const [album, tracks] = await Promise.all([
        getAlbum(params.id, token as string),
        getAlbumTracks(params.id, token as string)
    ]);

    if (!album) {
        notFound();
    }

    // 2. Fetch our DB Stats (Aggregations)
    const [logCount, reviewsData, avgRatingData] = await Promise.all([
        prisma.albumLog.count({ where: { spotifyAlbumId: params.id } }),
        prisma.review.findMany({
            where: { spotifyAlbumId: params.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                user: { select: { username: true, avatarUrl: true } }
            }
        }),
        prisma.rating.aggregate({
            where: { spotifyAlbumId: params.id },
            _avg: { score: true },
            _count: { score: true }
        })
    ]);

    // Try fetching score distributions (grouped 1 to 10 limits)
    const rawDistributions = await prisma.rating.groupBy({
        by: ['score'],
        where: { spotifyAlbumId: params.id },
        _count: { score: true },
    });

    // Map the raw group-by data into a solid 1-10 array for the BarChart
    const distributeStats = Array.from({ length: 10 }, (_, i) => i + 1).map(score => {
        // We allow 0.5 increments, but for a 1-10 bar block, maybe map floats by Math.ceil or similar
        // Let's just group by exact integer matches or round up
        const matches = rawDistributions.filter(d => Math.ceil(d.score) === score);
        const count = matches.reduce((acc, curr) => acc + curr._count.score, 0);
        return { score, count };
    });

    return (
        <main className="min-h-screen bg-bg text-text pb-24">

            {/* 
        ==============================
        HERO SECTION (Feature Wall)
        ==============================
      */}
            <section className="relative w-full overflow-hidden border-b border-border bg-gradient-to-b from-surface2 to-bg pt-24 pb-16 px-4 md:px-12">
                {/* Blurred Background effect */}
                <div className="absolute inset-0 opacity-10 pointer-events-none filter blur-[100px] transform scale-150">
                    <Image src={album.coverArt} alt="backdrop" fill className="object-cover" />
                </div>

                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-16 items-start relative z-10">

                    {/* Big Energy Cover Art */}
                    <div className="w-full max-w-[300px] md:max-w-[400px] shrink-0 mx-auto md:mx-0 shadow-2xl rounded shadow-accent/10 border border-border/50 group relative">
                        <Image
                            src={album.coverArt}
                            alt={album.name}
                            width={500}
                            height={500}
                            className="w-full h-auto object-cover rounded aspect-square"
                            priority
                        />
                    </div>

                    <div className="flex flex-col flex-1 w-full gap-5 h-full pt-4 md:pt-8">
                        <div className="flex flex-col">
                            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-white mb-2 leading-none">
                                {album.name}
                            </h1>

                            <div className="flex items-center gap-3 text-lg md:text-xl text-textMuted font-sans">
                                <span className="text-white font-medium">{album.artists.join(", ")}</span>
                                <span>•</span>
                                <span className="font-mono">{album.releaseYear}</span>
                                {album.label && (
                                    <>
                                        <span>•</span>
                                        <span className="italic truncate">{album.label}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Genres / Tags */}
                        {album.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {album.genres.slice(0, 4).map(genre => (
                                    <span key={genre} className="bg-surface border border-border px-3 py-1 rounded-full text-xs font-mono text-textMuted uppercase tracking-wider">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Quick Stats & Rating Box */}
                        <div className="mt-auto pt-8 flex gap-8 items-end flex-wrap">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs uppercase font-mono text-textMuted tracking-wider">Logged</span>
                                <span className="text-2xl font-serif text-white">{logCount.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs uppercase font-mono text-textMuted tracking-wider">Reviews</span>
                                <span className="text-2xl font-serif text-white">{avgRatingData._count.score.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1 items-end ml-auto md:ml-0 bg-surface2 px-4 py-2 rounded-md border border-border">
                                <span className="text-[10px] uppercase font-mono text-accent tracking-widest leading-none">Musicboxd Avg</span>
                                <div className="flex items-center gap-2 mt-1 -mb-1">
                                    <span className="text-3xl font-serif font-bold text-white leading-none">
                                        {(avgRatingData._avg.score || 0).toFixed(1)}
                                    </span>
                                    <div className="-mt-1">
                                        <RatingWidget score={avgRatingData._avg.score || 0} interactive={false} />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* 
        ==============================
        MAIN CONTENT COLUMNS
        ==============================
      */}
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 mt-16 px-4 md:px-12">

                {/* LEFT COLUMN: Tracklist & Reviews */}
                <div className="flex-1 flex flex-col gap-16">

                    {/* Action Bar / Controls */}
                    <ActionBar
                        spotifyAlbumId={album.id}
                        albumName={album.name}
                        isLoggedIn={!!session}
                    />

                    {/* Tracklist Interactive Player component */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-serif border-b border-border pb-2 text-textPrimary tracking-tight pl-2">Tracklist</h2>
                        <Tracklist tracks={tracks} />
                    </section>

                    {/* Reviews DB Feeds */}
                    <section className="flex flex-col gap-6">
                        <div className="flex items-end justify-between border-b border-border pb-2 px-2">
                            <h2 className="text-xl font-serif text-textPrimary tracking-tight">Recent Reviews</h2>
                            <span className="text-xs uppercase font-mono tracking-widest text-accent cursor-pointer hover:text-white">Write a Review</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {reviewsData.length === 0 ? (
                                <div className="p-12 text-center text-textMuted font-sans italic border border-dashed border-border rounded bg-surface2/30">
                                    No reviews logged yet. Be the first!
                                </div>
                            ) : (
                                reviewsData.map(review => (
                                    <ReviewCard
                                        key={review.id}
                                        user={{
                                            username: review.user.username,
                                            avatar: review.user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop"
                                        }}
                                        // Review model doesn't store rating score natively! (It's linked via UserId+AlbumId on the Rating Model)
                                        // For scaffolding simulation, let's mock the UI score until relations are joined fully.
                                        score={8.5}
                                        date={new Date(review.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: '2-digit' })}
                                        body={review.body}
                                    />
                                ))
                            )}
                        </div>
                    </section>

                </div>

                {/* RIGHT COLUMN: Sidebar Stats */}
                <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-10">

                    <div className="flex flex-col gap-3">
                        <h3 className="uppercase tracking-widest font-mono text-[11px] text-textMuted border-b border-border pb-2">Where to listen</h3>
                        <a href={album.spotifyUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded bg-surface border border-border hover:border-[#1DB954] transition-colors group">
                            <span className="font-sans text-sm font-semibold text-text group-hover:text-white">Spotify</span>
                            <svg className="w-5 h-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.3 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM20.16 9.6C15.96 7.08 9.24 6.9 5.4 8.04c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.32-1.32 11.76-1.08 16.56 1.8.54.36.72 1.02.36 1.56-.36.54-1.02.72-1.56.3z" /></svg>
                        </a>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <h3 className="uppercase tracking-widest font-mono text-[11px] text-textMuted">Ratings Curve</h3>
                        <RatingBarChart distribution={distributeStats} totalRatings={avgRatingData._count.score} />
                    </div>

                </aside>

            </div>
        </main>
    );
}
