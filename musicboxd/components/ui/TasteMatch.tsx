interface TasteMatchProps {
    score: number; // 0 to 100 percentage
}

export function TasteMatch({ score }: TasteMatchProps) {
    // Determine color shift based on percentage threshold
    let badgeColor = "bg-red-500/20 text-red-400 border-red-500/30";

    if (score >= 80) {
        badgeColor = "bg-accent/20 text-accent border-accent/40"; // Green
    } else if (score >= 50) {
        badgeColor = "bg-rating/20 text-rating border-rating/40"; // Yellow
    }

    return (
        <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-widest uppercase shadow-sm ${badgeColor} transition-colors hover:bg-opacity-30 cursor-default`}
            title={`${score}% taste overlap`}
        >
            <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path fillRule="evenodd" clipRule="evenodd" d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 11V7a1 1 0 112 0v4h2a1 1 0 110 2h-3a1 1 0 01-1-1z" />
            </svg>
            {score}% Match
        </div>
    );
}
