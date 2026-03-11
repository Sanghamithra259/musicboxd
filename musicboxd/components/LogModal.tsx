"use client";

import { useState } from "react";
import { RatingWidget } from "./ui/RatingWidget";

interface LogModalProps {
    isOpen: boolean;
    onClose: () => void;
    spotifyAlbumId: string;
    albumName: string;
    onSuccess: () => void;
}

export function LogModal({ isOpen, onClose, spotifyAlbumId, albumName, onSuccess }: LogModalProps) {
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [score, setScore] = useState(0);
    const [hasRated, setHasRated] = useState(false);
    const [review, setReview] = useState("");
    const [spoilers, setSpoilers] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const promises = [];

            // 1. Log
            promises.push(
                fetch("/api/log", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ spotifyAlbumId, listenedAt: date }),
                })
            );

            // 2. Rate
            if (hasRated) {
                promises.push(
                    fetch("/api/rate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ spotifyAlbumId, score }),
                    })
                );
            }

            // 3. Review
            if (review.trim()) {
                promises.push(
                    fetch("/api/review", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ spotifyAlbumId, body: review, containsSpoilers: spoilers }),
                    })
                );
            }

            // Execute all endpoints synchronously
            const results = await Promise.all(promises);

            for (const res of results) {
                if (!res.ok) {
                    console.error("Failed a request", await res.text());
                }
            }

            onSuccess();
        } catch (err) {
            console.error(err);
            alert("Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">

                <div className="flex items-center justify-between p-4 border-b border-border bg-surface2">
                    <h2 className="text-xl font-serif text-white">
                        I listened to <span className="italic text-accent">{albumName}</span>
                    </h2>
                    <button onClick={onClose} className="text-textMuted hover:text-white transition-colors" title="Close">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-6">

                    {/* Date Picker */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase font-mono tracking-widest text-textMuted">Date Listened</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-bg border border-border rounded px-3 py-2 text-text font-sans focus:outline-none focus:border-accent"
                            required
                        />
                    </div>

                    {/* Rating */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-xs uppercase font-mono tracking-widest text-textMuted flex items-center gap-2">
                            Rating
                            {hasRated && <span className="text-rating text-xs">{score.toFixed(1)}</span>}
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0" max="10" step="0.5"
                                value={score}
                                onChange={(e) => {
                                    setScore(parseFloat(e.target.value));
                                    setHasRated(true);
                                }}
                                className="w-full h-1 bg-surface2 rounded-lg appearance-none cursor-pointer accent-rating"
                            />
                            <div className="shrink-0 w-28 flex justify-end">
                                <RatingWidget score={score} interactive={false} />
                            </div>
                        </div>
                        {!hasRated && <p className="text-textMuted/50 text-[10px] absolute -bottom-4 italic font-sans">Move slider to rate</p>}
                    </div>

                    {/* Review Textarea */}
                    <div className="flex flex-col gap-2 mt-2">
                        <label className="text-xs uppercase font-mono tracking-widest text-textMuted flex justify-between">
                            Review
                            <span className="normal-case opacity-50 tracking-normal italic">Optional (Markdown supported)</span>
                        </label>
                        <textarea
                            rows={4}
                            placeholder="What did you think of the album?"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            className="bg-bg border border-border rounded px-3 py-2 text-text font-sans focus:outline-none focus:border-accent resize-y min-h-[100px]"
                        />

                        <label className="flex items-center gap-2 mt-2 cursor-pointer w-max">
                            <input
                                type="checkbox"
                                checked={spoilers}
                                onChange={(e) => setSpoilers(e.target.checked)}
                                className="accent-accent w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm font-sans text-textMuted select-none">Contains spoilers</span>
                        </label>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded text-text font-bold uppercase font-mono tracking-widest text-sm hover:bg-surface2 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="bg-accent text-bg px-5 py-2 rounded font-bold uppercase font-mono tracking-widest text-sm hover:bg-white transition-colors disabled:opacity-50">
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
