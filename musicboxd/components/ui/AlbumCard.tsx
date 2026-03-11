import Image from "next/image";

interface AlbumCardProps {
    coverArt: string;
    title: string;
    artist: string;
    avgRating?: number; // 0 to 10
}

export function AlbumCard({ coverArt, title, artist, avgRating }: AlbumCardProps) {
    return (
        <div className="group relative flex flex-col gap-3 cursor-pointer w-[160px] md:w-[200px]">
            {/* Cover Container */}
            <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border bg-surface transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:border-accent/30">

                <Image
                    src={coverArt}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover Log Overlay */}
                <div className="absolute inset-0 bg-accent/70 opacity-0 transition-opacity duration-300 flex items-center justify-center group-hover:opacity-100 backdrop-blur-[2px]">
                    <span className="font-serif text-white text-xl font-bold tracking-wider">
                        Log
                    </span>
                </div>

                {/* Rating Badge Overlay (Bottom Right) */}
                {avgRating !== undefined && (
                    <div className="absolute bottom-2 right-2 bg-bg/90 backdrop-blur-md px-2 py-1 flex items-center rounded text-rating font-mono text-xs font-bold shadow-lg border border-border/50">
                        ★ {(avgRating / 2).toFixed(1)}
                    </div>
                )}
            </div>

            {/* Info constraints to strictly wrap/truncate text natively */}
            <div className="flex flex-col gap-0.5 px-1 truncate">
                <h3 className="text-textPrimary font-semibold text-sm truncate font-sans">
                    {title}
                </h3>
                <p className="text-textMuted text-xs truncate font-serif italic">
                    {artist}
                </p>
            </div>
        </div>
    );
}
