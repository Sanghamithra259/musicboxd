"use client";

import { useState, useRef } from "react";
import { Track } from "@/lib/spotify";

interface TracklistProps {
    tracks: Track[];
}

export function Tracklist({ tracks }: TracklistProps) {
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = (trackId: string, previewUrl: string) => {
        // If the same track is clicked, pause it
        if (playingId === trackId) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setPlayingId(null);
            return;
        }

        // Otherwise, play the new track
        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(previewUrl);
        audio.play().catch((err) => console.error("Audio playback error:", err));
        audio.onended = () => setPlayingId(null); // Reset when finished

        audioRef.current = audio;
        setPlayingId(trackId);
    };

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return minutes + ":" + (Number(seconds) < 10 ? "0" : "") + seconds;
    };

    return (
        <div className="flex flex-col w-full text-sm">
            <div className="flex border-b border-border pb-2 mb-2 text-textMuted font-sans uppercase tracking-wider text-xs px-2">
                <div className="w-10 text-right pr-4">#</div>
                <div className="flex-1">Title</div>
                <div className="w-16 text-right">Time</div>
            </div>

            {tracks.map((track) => (
                <div
                    key={track.id}
                    className="group flex items-center hover:bg-surface2/50 rounded-md py-2 px-2 transition-colors cursor-default"
                >
                    {/* Number Output or Play Button override */}
                    <div className="w-10 text-right pr-4 text-textMuted font-mono">
                        {track.previewUrl ? (
                            <button
                                onClick={() => togglePlay(track.id, track.previewUrl!)}
                                className={`w-5 h-5 flex items-center justify-center rounded-full transition-colors ml-auto ${playingId === track.id ? 'bg-accent text-bg' : 'bg-transparent text-textMuted group-hover:bg-text group-hover:text-bg'}`}
                                title="Play 30s preview"
                            >
                                {playingId === track.id ? (
                                    // Pause Icon
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                ) : (
                                    // Play Icon (visible on hover)
                                    <svg className="w-3 h-3 fill-current opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                                {/* Number (visible when NOT hovered) */}
                                <span className={`absolute text-xs ${playingId === track.id ? 'hidden' : 'group-hover:hidden'}`}>
                                    {track.trackNumber}
                                </span>
                            </button>
                        ) : (
                            <span>{track.trackNumber}</span>
                        )}
                    </div>

                    <div className={`flex-1 font-sans ${playingId === track.id ? 'text-accent font-medium' : 'text-textPrimary'}`}>
                        {track.name}
                    </div>

                    <div className="w-16 text-right text-textMuted font-mono text-xs">
                        {formatDuration(track.durationMs)}
                    </div>
                </div>
            ))}
        </div>
    );
}
