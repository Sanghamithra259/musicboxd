import Image from "next/image";
import { RatingWidget } from "./RatingWidget";

interface ReviewCardProps {
    user: {
        avatar: string;
        username: string;
    };
    score: number;
    date: string; // e.g., "14 Mar '24"
    body: string;
}

export function ReviewCard({ user, score, date, body }: ReviewCardProps) {
    return (
        <article className="flex flex-col md:flex-row gap-4 p-5 rounded-lg border border-border bg-surface2/50 backdrop-blur-sm transition-colors hover:border-border/80">

            {/* Left Column: Author */}
            <div className="flex flex-row md:flex-col items-center gap-3 w-full md:w-[120px] shrink-0">
                <div className="relative w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden border border-border/50">
                    <Image src={user.avatar} alt={user.username} fill className="object-cover" />
                </div>

                <div className="flex flex-col md:items-center">
                    <p className="font-semibold text-textPrimary text-sm font-sans tracking-wide">
                        {user.username}
                    </p>
                    <div className="flex md:hidden items-center mt-1">
                        <RatingWidget score={score} />
                    </div>
                </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex flex-col flex-grow gap-2">
                <div className="hidden md:flex flex-row items-center justify-between">
                    <RatingWidget score={score} />
                    <time className="text-textMuted text-xs font-mono uppercase tracking-widest bg-surface px-2 py-1 rounded">
                        {date}
                    </time>
                </div>

                {/* Small Screen Date (Right aligned top on mobile usually) */}
                <time className="md:hidden absolute top-5 right-5 text-textMuted text-[10px] font-mono uppercase tracking-widest bg-surface px-2 py-1 rounded">
                    {date}
                </time>

                <div className="mt-2 md:mt-1">
                    <p className="text-textPrimary text-sm font-sans leading-relaxed whitespace-pre-wrap">
                        {body}
                    </p>
                </div>
            </div>

        </article>
    );
}
