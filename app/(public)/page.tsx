"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Users,
  BarChart3,
  Star,
  List,
  BookMarked,
  Import,
  ScanBarcode,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/* ─── Google Books cover helper — reliable, high-quality, correct covers ─── */

const cover = (googleId: string) =>
  `https://books.google.com/books/content?id=${googleId}&printsec=frontcover&img=1&zoom=2`;

/* ─── Book data using Google Books IDs for reliable high-quality covers ─── */

// Row 1: Fiction & romance bestsellers
const HERO_ROW_1 = [
  "uvFVRiAIVpYC", // The Book Thief
  "KmbkCgAAQBAJ", // It Ends with Us
  "iAblDwAAQBAJ", // Dune
  "hxL2qWMAgv8C", // Gone Girl
  "rMGoDwAAQBAJ", // Becoming
  "fFCjDQAAQBAJ", // Atomic Habits
  "VJZWEAAAQBAJ", // Daisy Jones & The Six
  "o79lk6nTsRgC", // The Handmaid's Tale
  "jVB1DwAAQBAJ", // Where the Crawdads Sing
  "njVpDQAAQBAJ", // Seven Husbands of Evelyn Hugo
  "Qk8n0olOX5MC", // The Fault in Our Stars
  "TJZWEAAAQBAJ", // Verity
  "a6NnDwAAQBAJ", // The Silent Patient
  "8U2oAAAAQBAJ", // Steve Jobs
];

// Row 2: Classics, Murakami, Dostoevsky, philosophy
const HERO_ROW_2 = [
  "iXn5U2IzVH0C", // The Great Gatsby
  "1L-jEAAAQBAJ", // 1984
  "Fse0EAAAQBAJ", // The Hobbit (Illustrated)
  "ydULEQAAQBAJ", // Pride and Prejudice
  "ayJpGQeyxgkC", // To Kill a Mockingbird
  "3PabEAAAQBAJ", // Brave New World
  "mZunDwAAQBAJ", // The Catcher in the Rye
  "L6AtuutQHpwC", // Kafka on the Shore — Murakami
  "kd1XlWVAIWQC", // Norwegian Wood — Murakami
  "zlVhEAAAQBAJ", // 1Q84 — Murakami
  "0HZrq-4zA5QC", // Crime and Punishment
  "BZvXZ1au0VcC", // Brothers Karamazov
  "IAVT6awraTAC", // Rebecca — du Maurier
  "S4_PyiyJixQC", // The Secret History
];

// Row 3: Non-fiction, self-help, biographies
const HERO_ROW_3 = [
  "1EiJAwAAQBAJ", // Sapiens
  "JZwpDwAAQBAJ", // Educated
  "ypguDwAAQBAJ", // The Tattooist of Auschwitz
  "63fYDwAAQBAJ", // The Midnight Library
  "GwAWS6C33O4C", // The Night Circus
  "x3tgDwAAQBAJ", // Normal People
  "szMU9omwV0wC", // The Song of Achilles
  "T2CA83gbtM8C", // The Goldfinch
  "fUA_DQAAQBAJ", // Little Fires Everywhere
  "b2CZEAAAQBAJ", // A Man Called Ove
  "6_mzEAAAQBAJ", // Elon Musk
  "dyikEAAAQBAJ", // Circe
  "LbOfEAAAQBAJ", // Pachinko
  "KUMIEAAAQBAJ", // The Kite Runner
];

// Row 4: Greatest hits mix
const HERO_ROW_4 = [
  "IAVT6awraTAC", // Rebecca
  "uvFVRiAIVpYC", // The Book Thief
  "hxL2qWMAgv8C", // Gone Girl
  "iXn5U2IzVH0C", // The Great Gatsby
  "jVB1DwAAQBAJ", // Where the Crawdads Sing
  "iAblDwAAQBAJ", // Dune
  "fFCjDQAAQBAJ", // Atomic Habits
  "VJZWEAAAQBAJ", // Daisy Jones & The Six
  "1L-jEAAAQBAJ", // 1984
  "KmbkCgAAQBAJ", // It Ends with Us
  "8U2oAAAAQBAJ", // Steve Jobs
  "o79lk6nTsRgC", // The Handmaid's Tale
  "njVpDQAAQBAJ", // Seven Husbands of Evelyn Hugo
  "rMGoDwAAQBAJ", // Becoming
];

const POPULAR_BOOKS = [
  {
    id: 1,
    title: "It Ends with Us",
    author: "Colleen Hoover",
    gid: "KmbkCgAAQBAJ",
  },
  {
    id: 2,
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    gid: "jVB1DwAAQBAJ",
  },
  { id: 3, title: "Atomic Habits", author: "James Clear", gid: "fFCjDQAAQBAJ" },
  { id: 4, title: "Gone Girl", author: "Gillian Flynn", gid: "hxL2qWMAgv8C" },
  {
    id: 5,
    title: "The Book Thief",
    author: "Markus Zusak",
    gid: "uvFVRiAIVpYC",
  },
  {
    id: 6,
    title: "The Fault in Our Stars",
    author: "John Green",
    gid: "Qk8n0olOX5MC",
  },
  {
    id: 7,
    title: "Daisy Jones & The Six",
    author: "Taylor Jenkins Reid",
    gid: "VJZWEAAAQBAJ",
  },
  { id: 8, title: "Becoming", author: "Michelle Obama", gid: "rMGoDwAAQBAJ" },
];

const RECENT_REVIEWS = [
  {
    id: 1,
    bookTitle: "It Ends with Us",
    author: "Colleen Hoover",
    gid: "KmbkCgAAQBAJ",
    reviewer: "booktokqueen",
    rating: 5,
    text: "I could not put this down. The twist destroyed me. Colleen Hoover understands heartbreak on a level that feels almost unfair.",
  },
  {
    id: 2,
    bookTitle: "Gone Girl",
    author: "Gillian Flynn",
    gid: "hxL2qWMAgv8C",
    reviewer: "thrilleraddict",
    rating: 4.5,
    text: "The most unreliable narrator ever written. Every chapter pulled the rug out from under me. Finished it at 3am. Masterful.",
  },
  {
    id: 3,
    bookTitle: "Atomic Habits",
    author: "James Clear",
    gid: "fFCjDQAAQBAJ",
    reviewer: "selfimprover",
    rating: 4,
    text: "Changed how I think about daily routines. The 1% better every day framework is simple but genuinely life-changing. A must-read.",
  },
];

const POPULAR_LISTS = [
  {
    id: 1,
    title: "Books that made me ugly cry",
    listAuthor: "devastated_reader",
    count: 24,
    gids: [
      "KmbkCgAAQBAJ",
      "Qk8n0olOX5MC",
      "szMU9omwV0wC",
      "x3tgDwAAQBAJ",
      "jVB1DwAAQBAJ",
    ],
  },
  {
    id: 2,
    title: "Thrillers you'll finish in one night",
    listAuthor: "pageturner",
    count: 36,
    gids: [
      "hxL2qWMAgv8C",
      "a6NnDwAAQBAJ",
      "fUA_DQAAQBAJ",
      "jVB1DwAAQBAJ",
      "njVpDQAAQBAJ",
    ],
  },
  {
    id: 3,
    title: "Books everyone should read once",
    listAuthor: "classicsnerd",
    count: 50,
    gids: [
      "iXn5U2IzVH0C",
      "1L-jEAAAQBAJ",
      "uvFVRiAIVpYC",
      "o79lk6nTsRgC",
      "iAblDwAAQBAJ",
    ],
  },
];

/* ─── Sub-components ─── */

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="rounded-sm border border-border/40 bg-secondary/30 p-5">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-sm bg-shelvitas-green/10 text-shelvitas-green">
      {icon}
    </div>
    <h3 className="mb-1 text-sm font-semibold text-foreground">{title}</h3>
    <p className="text-sm leading-relaxed text-muted-foreground">
      {description}
    </p>
  </div>
);

const SectionHeader = ({
  label,
  href,
  linkText,
}: {
  label: string;
  href: string;
  linkText: string;
}) => (
  <div className="flex items-baseline justify-between">
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {label}
    </h2>
    <Link
      href={href}
      className="text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-shelvitas-blue"
    >
      {linkText}
    </Link>
  </div>
);

const HeroRow = ({
  gids,
  direction,
}: {
  gids: string[];
  direction: "left" | "right";
}) => (
  <div
    className={`flex gap-2 ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}`}
  >
    {[...gids, ...gids].map((gid, idx) => (
      <div
        key={`hero-${gid}-${idx < gids.length ? "a" : "b"}`}
        className="w-[105px] flex-shrink-0 overflow-hidden rounded-sm bg-secondary"
      >
        <img
          src={cover(gid)}
          alt=""
          className="aspect-[2/3] w-full object-cover"
          loading="lazy"
        />
      </div>
    ))}
  </div>
);

const BookCover = ({
  title,
  author,
  gid,
}: {
  title: string;
  author: string;
  gid: string;
}) => (
  <div className="group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-sm border border-white/5 shadow-sm transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-md">
    <img
      src={cover(gid)}
      alt={title}
      className="h-full w-full object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
      <p className="truncate text-xs font-semibold text-white">{title}</p>
      <p className="truncate text-[10px] text-white/70">{author}</p>
    </div>
  </div>
);

const ReviewCard = ({
  bookTitle,
  author,
  reviewer,
  rating,
  text,
  gid,
}: {
  bookTitle: string;
  author: string;
  reviewer: string;
  rating: number;
  text: string;
  gid: string;
}) => (
  <div className="space-y-3">
    <div className="flex gap-3">
      <img
        src={cover(gid)}
        alt={bookTitle}
        className="h-24 w-16 flex-shrink-0 rounded-sm object-cover"
        loading="lazy"
      />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold">{bookTitle}</p>
        <p className="text-xs text-muted-foreground">{author}</p>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              let starClass = "text-secondary";
              if (i < Math.floor(rating)) {
                starClass = "fill-shelvitas-green text-shelvitas-green";
              } else if (i < rating) {
                starClass = "fill-shelvitas-green/50 text-shelvitas-green";
              }
              return (
                <Star
                  key={`${bookTitle}-star-${i + 1}`}
                  className={`h-3 w-3 ${starClass}`}
                />
              );
            })}
          </div>
          <span className="text-xs text-muted-foreground">by @{reviewer}</span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  </div>
);

const ListCard = ({
  title,
  listAuthor,
  count,
  gids,
}: {
  title: string;
  listAuthor: string;
  count: number;
  gids: string[];
}) => (
  <div className="group cursor-pointer">
    <div className="relative mb-3 h-32">
      {gids.map((gid, i) => (
        <img
          key={`${title}-cover-${gid}`}
          src={cover(gid)}
          alt=""
          className="absolute top-0 h-full w-auto rounded-sm border border-white/10 object-cover shadow-sm transition-transform group-hover:translate-x-0.5"
          style={{ left: `${i * 18}%`, zIndex: 5 - i }}
          loading="lazy"
        />
      ))}
    </div>
    <p className="text-sm font-semibold transition-colors group-hover:text-shelvitas-blue">
      {title}
    </p>
    <p className="text-xs text-muted-foreground">
      @{listAuthor} &middot; {count} books
    </p>
  </div>
);

/* ─── Page ─── */

const HomePage = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar transparent />

    {/* Hero — multi-row animated book covers (bleeds under navbar) */}
    <section className="relative -mt-14 overflow-hidden">
      <div
        className="absolute inset-0 z-0 flex flex-col justify-center gap-2 opacity-40"
        style={{
          perspective: "1200px",
        }}
      >
        <div
          className="flex flex-col justify-center gap-2"
          style={{
            transform:
              "rotateX(30deg) rotateY(5deg) rotateZ(-15deg) scale(2.0)",
            transformOrigin: "center center",
          }}
        >
          <div className="overflow-hidden">
            <HeroRow gids={HERO_ROW_1} direction="left" />
          </div>
          <div className="overflow-hidden">
            <HeroRow gids={HERO_ROW_2} direction="right" />
          </div>
          <div className="overflow-hidden">
            <HeroRow gids={HERO_ROW_3} direction="left" />
          </div>
          <div className="overflow-hidden">
            <HeroRow gids={HERO_ROW_4} direction="right" />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/20 via-background/60 to-background" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-background/80 via-transparent to-background/80" />

      <div className="container relative z-10 flex flex-col items-center pb-28 pt-40 text-center md:pb-40 md:pt-52">
        <Image
          src="/logo.svg"
          alt="Shelvitas"
          width={72}
          height={72}
          className="mb-5"
        />
        <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-[2.75rem] md:leading-tight">
          Track books you&apos;ve read.
          <br />
          Save those you want to read.
          <br />
          <span className="text-shelvitas-green">
            Tell your friends what&apos;s good.
          </span>
        </h1>
        <Link href="/sign-up" className="mt-8">
          <Button
            size="lg"
            className="bg-shelvitas-green px-8 text-base font-semibold text-background hover:bg-shelvitas-green/90"
          >
            Get started — it&apos;s free!
          </Button>
        </Link>
      </div>
    </section>

    {/* "Shelvitas lets you..." */}
    <section>
      <div className="container py-12">
        <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-shelvitas-green">
          Shelvitas lets you...
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<BookMarked className="h-5 w-5" />}
            title="Keep a reading diary"
            description="Log every book with start and finish dates, ratings, format, and private notes. Your reading history becomes a permanent, personal archive."
          />
          <FeatureCard
            icon={<Star className="h-5 w-5" />}
            title="Rate and review"
            description="5-star ratings with halves. Write reviews with spoiler tags. DNF reviews are first-class content, not a stigma. No character limit."
          />
          <FeatureCard
            icon={<Users className="h-5 w-5" />}
            title="Follow readers you trust"
            description="Asymmetric following — curate a feed of people whose taste you admire. One friend's 5-star rating beats any algorithm."
          />
          <FeatureCard
            icon={<List className="h-5 w-5" />}
            title="Create and share lists"
            description="Unlimited public and private lists. Ranked or unranked. The most viral, shareable content unit on the platform."
          />
          <FeatureCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Track what you're reading"
            description="Want to Read, Currently Reading, Read — and Did Not Finish. Track progress by page or percentage. Multiple books in parallel."
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="See your reading stats"
            description="Books read, pages logged, top genres, reading pace, format breakdown. Annual Year in Review — shareable and beautiful."
          />
        </div>
      </div>
    </section>

    {/* Popular this week */}
    <section>
      <div className="container py-12">
        <SectionHeader
          label="Popular this week"
          href="/books/popular"
          linkText="More"
        />
        <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {POPULAR_BOOKS.map((book) => (
            <BookCover
              key={book.id}
              title={book.title}
              author={book.author}
              gid={book.gid}
            />
          ))}
        </div>
      </div>
    </section>

    {/* Just reviewed */}
    <section>
      <div className="container py-12">
        <SectionHeader
          label="Just reviewed..."
          href="/reviews/recent"
          linkText="More"
        />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RECENT_REVIEWS.map((r) => (
            <ReviewCard
              key={r.id}
              bookTitle={r.bookTitle}
              author={r.author}
              reviewer={r.reviewer}
              rating={r.rating}
              text={r.text}
              gid={r.gid}
            />
          ))}
        </div>
      </div>
    </section>

    {/* Popular shelves */}
    <section>
      <div className="container py-12">
        <SectionHeader label="Popular shelves" href="/shelves" linkText="More" />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_LISTS.map((l) => (
            <ListCard
              key={l.id}
              title={l.title}
              listAuthor={l.listAuthor}
              count={l.count}
              gids={l.gids}
            />
          ))}
        </div>
      </div>
    </section>

    {/* Built for books */}
    <section>
      <div className="container py-12">
        <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Built for books, not retrofitted
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<ScanBarcode className="h-5 w-5" />}
            title="Barcode scanner"
            description="Scan any book's barcode at the bookshop or your shelf. Instantly log or add to Want to Read in two taps."
          />
          <FeatureCard
            icon={<Import className="h-5 w-5" />}
            title="Goodreads import"
            description="3-click migration. Bring your books, ratings, reviews, shelves, and dates. Zero switching cost."
          />
          <FeatureCard
            icon={<Lock className="h-5 w-5" />}
            title="Private profiles"
            description="Full private mode with follow requests. Individual lists can be private even on public profiles. Your data, your rules."
          />
          <FeatureCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Series tracking"
            description="Series pages with correct reading order. See your progress — 'You've read 3 of 7.' Never lose your place."
          />
        </div>
      </div>
    </section>

    {/* Bottom CTA */}
    <section>
      <div className="container flex flex-col items-center py-16 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">
          The Letterboxd for books.
        </h2>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Goodreads has 150M+ users and hasn&apos;t shipped a meaningful update
          since 2013. Shelvitas is what they should have built. Import your
          library and see the difference.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-shelvitas-green px-8 font-semibold text-background hover:bg-shelvitas-green/90"
            >
              Create your account
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default HomePage;
