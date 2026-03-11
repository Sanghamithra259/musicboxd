// "use client";

interface RatingBarChartProps {
    distribution: { score: number; count: number }[]; // Array of exactly 10 items (scores 1-10)
    totalRatings: number;
}

export function RatingBarChart({ distribution, totalRatings }: RatingBarChartProps) {
    // Defensive check
    if (!totalRatings || totalRatings === 0) {
        return (
            <div className="text-textMuted text-xs font-mono italic">
                No ratings to display yet.
            </div>
        );
    }

    // Find max count to normalize bar heights
    const maxCount = Math.max(...distribution.map((d) => d.count));

    return (
        <div className="flex border-b border-border w-full h-[60px] pb-1 gap-1 items-end pt-8 relative">
            <div className="absolute top-0 right-0 text-textMuted text-[10px] uppercase font-mono tracking-widest">
                Rating Spread
            </div>

            {distribution.map((d) => {
                // Calculate relative height percentage (0-100%)
                const heightPct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;

                return (
                    <div
                        key={d.score}
                        className="flex-1 rounded-sm bg-surface2 hover:bg-rating/80 transition-colors group relative cursor-pointer flex flex-col justify-end min-h-[4px]"
                        style={{ height: `${heightPct}%` }}
                    >
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -transform-translate-x-1/2 bg-bg border border-border px-2 py-1 rounded text-xs text-text opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-mono z-10 whitespace-nowrap shadow-xl">
                            {d.count} ({((d.count / totalRatings) * 100).toFixed(0)}%)
                        </div>
                        {/* Score label underneath the bar graph baseline */}
                        <div className="absolute -bottom-5 w-full text-center text-textMuted text-[10px] font-mono select-none">
                            {d.score}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
