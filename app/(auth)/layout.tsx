import Link from "next/link";
import Image from "next/image";

/* Book covers for the mosaic — verified Google Books IDs with real covers */
const COLUMN_1 = [
  "fFCjDQAAQBAJ",
  "hxL2qWMAgv8C",
  "iXn5U2IzVH0C",
  "KmbkCgAAQBAJ",
  "kd1XlWVAIWQC",
  "1L-jEAAAQBAJ",
  "Qk8n0olOX5MC",
  "a6NnDwAAQBAJ",
];
const COLUMN_2 = [
  "rMGoDwAAQBAJ",
  "iAblDwAAQBAJ",
  "3PabEAAAQBAJ",
  "VJZWEAAAQBAJ",
  "BZvXZ1au0VcC",
  "jVB1DwAAQBAJ",
  "szMU9omwV0wC",
  "TJZWEAAAQBAJ",
];
const COLUMN_3 = [
  "njVpDQAAQBAJ",
  "GwAWS6C33O4C",
  "0HZrq-4zA5QC",
  "uvFVRiAIVpYC",
  "dyikEAAAQBAJ",
  "63fYDwAAQBAJ",
  "zlVhEAAAQBAJ",
  "T2CA83gbtM8C",
];

const coverUrl = (gid: string) =>
  `https://books.google.com/books/content?id=${gid}&printsec=frontcover&img=1&zoom=2`;

const QUOTES = [
  {
    text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
    author: "George R.R. Martin",
  },
  {
    text: "Until I feared I would lose it, I never loved to read. One does not love breathing.",
    author: "Harper Lee",
  },
  {
    text: "Reading is essential for those who seek to rise above the ordinary.",
    author: "Jim Rohn",
  },
];

const MosaicColumn = ({
  gids,
  direction,
}: {
  gids: string[];
  direction: "up" | "down";
}) => (
  <div className="overflow-hidden">
    <div
      className={`flex flex-col gap-2 ${direction === "up" ? "animate-float-up" : "animate-float-down"}`}
    >
      {[...gids, ...gids].map((gid, i) => (
        <img
          key={`mosaic-${gid}-${i < gids.length ? "a" : "b"}`}
          src={coverUrl(gid)}
          alt=""
          className="w-full rounded-sm object-cover"
          loading="lazy"
        />
      ))}
    </div>
  </div>
);

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length];

  return (
    <div className="flex min-h-screen">
      {/* Left: Book cover mosaic — hidden on mobile */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        {/* Mosaic grid — 3 columns scrolling in alternating directions */}
        <div className="absolute inset-0 grid grid-cols-3 gap-2 p-2 opacity-60">
          <MosaicColumn gids={COLUMN_1} direction="up" />
          <MosaicColumn gids={COLUMN_2} direction="down" />
          <MosaicColumn gids={COLUMN_3} direction="up" />
        </div>

        {/* Dark overlay + gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />

        {/* Quote overlay */}
        <div className="absolute inset-0 flex flex-col items-start justify-end p-12">
          <blockquote className="max-w-md">
            <p className="text-lg font-medium leading-relaxed text-foreground/90">
              &ldquo;{quote.text}&rdquo;
            </p>
            <footer className="mt-3 text-sm text-muted-foreground">
              — {quote.author}
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Mobile: mini mosaic banner */}
        <div className="relative mx-6 h-32 overflow-hidden rounded-sm lg:hidden">
          <div className="absolute inset-0 flex gap-1 opacity-50">
            {[...COLUMN_1, ...COLUMN_2].slice(0, 8).map((gid) => (
              <img
                key={`mobile-${gid}`}
                src={coverUrl(gid)}
                alt=""
                className="h-full w-auto flex-shrink-0 rounded-sm object-cover"
                loading="lazy"
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-xs font-medium text-foreground/80">
              &ldquo;{quote.text.slice(0, 80)}...&rdquo;
            </p>
          </div>
        </div>

        {/* Form area */}
        <main className="flex flex-1 items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-sm">
            <Link
              href="/"
              className="mb-12 flex items-center justify-center gap-0.5 pb-8"
            >
              <Image src="/logo.svg" alt="Shelvitas" width={40} height={40} />
              <span className="text-3xl font-bold tracking-tight text-foreground">
                Shelvitas
              </span>
            </Link>
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 text-center text-xs text-muted-foreground lg:px-10">
          &copy; {new Date().getFullYear()} Shelvitas. Made for book lovers.
        </footer>
      </div>
    </div>
  );
};

export default AuthLayout;
