"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogModal } from "../LogModal";

interface ActionBarProps {
    spotifyAlbumId: string;
    albumName: string;
    isLoggedIn: boolean;
}

export function ActionBar({ spotifyAlbumId, albumName, isLoggedIn }: ActionBarProps) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [toast, setToast] = useState("");
    const router = useRouter();

    const handleSuccess = () => {
        setModalOpen(false);
        setToast("Logged!");

        // Optimistic re-fetch of server components
        router.refresh();

        // Clear toast after a bit
        setTimeout(() => {
            setToast("");
        }, 4000);
    };

    if (!isLoggedIn) {
        return (
            <div className="w-full bg-surface2 border border-border p-6 rounded text-center flex flex-col gap-3 items-center">
                <p className="font-sans text-textMuted text-sm">
                    Sign in to log, rate, or review <span className="text-white italic font-serif">{albumName}</span>.
                </p>
                <Link href="/api/auth/signin" className="bg-accent text-bg px-6 py-2 rounded font-mono font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors">
                    Sign in with Spotify
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="flex gap-4 relative">
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex-1 bg-accent text-bg font-bold uppercase font-mono tracking-widest py-3 rounded hover:bg-white transition-colors text-sm"
                >
                    {toast ? toast : "Log & Rate"}
                </button>
                <button
                    onClick={() => alert("Add to List coming soon!")}
                    className="flex-1 bg-surface border border-border text-text font-bold uppercase font-mono tracking-widest py-3 rounded hover:bg-surface2 transition-colors text-sm"
                >
                    Add to List
                </button>
                <button
                    onClick={() => alert("Share coming soon!")}
                    className="bg-surface border border-border text-text font-bold font-mono py-3 px-4 rounded hover:bg-surface2 transition-colors flex items-center justify-center"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" /></svg>
                </button>
            </div>

            <LogModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                spotifyAlbumId={spotifyAlbumId}
                albumName={albumName}
                onSuccess={handleSuccess}
            />
        </>
    );
}
