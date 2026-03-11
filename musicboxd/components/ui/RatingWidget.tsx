interface RatingWidgetProps {
    score: number; // Expecting 0 to 10
    interactive?: boolean;
}

export function RatingWidget({ score, interactive = false }: RatingWidgetProps) {
    // Convert 0-10 score down to 0-5 stars
    const filledStars = Math.floor(score / 2);
    const halfStar = score % 2 !== 0;     // e.g., 7 % 2 = 1 (true)
    const emptyStars = 5 - filledStars - (halfStar ? 1 : 0);

    const starClasses = "w-3 h-3 md:w-4 md:h-4 text-rating transition-transform";

    return (
        <div className={`flex flex-row items-center gap-1 ${interactive ? 'cursor-pointer' : ''}`}>
            {/* Filled stars */}
            {Array.from({ length: filledStars }).map((_, i) => (
                <svg key={`filled-${i}`} className={starClasses} viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                </svg>
            ))}

            {/* Half star SVG trick using definitions */}
            {halfStar && (
                <svg key="half" className={starClasses} viewBox="0 0 24 24">
                    <defs>
                        <clipPath id="left-half-clip">
                            <rect x="0" y="0" width="12" height="24" />
                        </clipPath>
                    </defs>
                    <circle cx="12" cy="12" r="10" fill="transparent" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="10" fill="currentColor" clipPath="url(#left-half-clip)" />
                </svg>
            )}

            {/* Empty stars */}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <svg key={`empty-${i}`} className={starClasses} viewBox="0 0 24 24" fill="transparent" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                </svg>
            ))}
        </div>
    );
}
