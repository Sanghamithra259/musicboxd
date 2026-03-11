import { AlbumCard } from "@/components/ui/AlbumCard";
import { RatingWidget } from "@/components/ui/RatingWidget";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { TasteMatch } from "@/components/ui/TasteMatch";

export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-24 max-w-5xl mx-auto flex flex-col gap-16">
      <header className="flex flex-col gap-4 border-b border-border pb-8">
        <h1 className="text-4xl md:text-5xl font-serif text-textPrimary tracking-tight">
          Musicboxd <span className="text-accent italic">Design System</span>
        </h1>
        <p className="text-textMuted font-sans max-w-xl text-lg">
          A showcase of the building blocks for the editorial, vinyl-era UI.
        </p>
      </header>

      {/* Album Cards */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-serif text-textPrimary border-l-4 border-accent pl-4">
          1. Album Cards
        </h2>
        <div className="flex flex-wrap gap-6">
          <AlbumCard
            title="Abbey Road"
            artist="The Beatles"
            coverArt="https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25"
            avgRating={9.5}
          />
          <AlbumCard
            title="IGOR"
            artist="Tyler, The Creator"
            coverArt="https://i.scdn.co/image/ab67616d0000b2737005885df706891a3c182a57"
            avgRating={8.8}
          />
          <AlbumCard
            title="Rumours"
            artist="Fleetwood Mac"
            coverArt="https://i.scdn.co/image/ab67616d0000b2738276fcc8c25785f76b0051ba"
            avgRating={10.0}
          />
        </div>
      </section>

      {/* Ratings API components */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-serif text-textPrimary border-l-4 border-accent pl-4">
          2. Rating Widgets
        </h2>
        <div className="flex flex-col gap-4 p-6 rounded-md bg-surface2 border border-border w-max">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs w-8 text-textMuted">10.0</span>
            <RatingWidget score={10} interactive />
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs w-8 text-textMuted">8.5</span>
            <RatingWidget score={8.5} interactive />
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs w-8 text-textMuted">5.0</span>
            <RatingWidget score={5} interactive />
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs w-8 text-textMuted">1.5</span>
            <RatingWidget score={1.5} interactive />
          </div>
        </div>
      </section>

      {/* Reviews & Match Rates */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-serif text-textPrimary border-l-4 border-accent pl-4">
          3. Reviews & Taste Matching
        </h2>
        <div className="flex gap-4 mb-2">
          <TasteMatch score={92} />
          <TasteMatch score={65} />
          <TasteMatch score={20} />
        </div>

        <div className="flex flex-col gap-4">
          <ReviewCard
            user={{ username: "audiophile99", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" }}
            score={9.5}
            date="21 Oct '24"
            body={`The production on this record is absolutely immaculate. Every single layer feels intentional, leaving enough breathing room for the bassline to just absolutely take over the room.\n\nDefinitely a top 5 of the decade so far without any skips.`}
          />

          <ReviewCard
            user={{ username: "vinyljunkie", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop" }}
            score={6.0}
            date="02 Nov '24"
            body="A bit too derivative of their earlier work. It sounds good, but they played it vastly too safe here."
          />
        </div>
      </section>

    </main>
  );
}
