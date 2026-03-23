import Link from "next/link";
import Image from "next/image";
import { BookOpen, Users, BarChart3, Star, List, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/* ─── Data ─── */

const SAMPLE_COVERS = [
  { id: 1, color: "bg-amber-800", title: "Dune" },
  { id: 2, color: "bg-emerald-900", title: "The Great Gatsby" },
  { id: 3, color: "bg-sky-900", title: "1984" },
  { id: 4, color: "bg-rose-900", title: "Beloved" },
  { id: 5, color: "bg-violet-900", title: "Neuromancer" },
  { id: 6, color: "bg-orange-900", title: "Circe" },
  { id: 7, color: "bg-teal-900", title: "Piranesi" },
  { id: 8, color: "bg-pink-900", title: "Normal People" },
  { id: 9, color: "bg-indigo-900", title: "Project Hail Mary" },
  { id: 10, color: "bg-yellow-900", title: "Klara and the Sun" },
  { id: 11, color: "bg-cyan-900", title: "The Goldfinch" },
  { id: 12, color: "bg-lime-900", title: "Pachinko" },
];

const PLACEHOLDER_COLORS = [
  "bg-amber-800/60",
  "bg-emerald-800/60",
  "bg-sky-800/60",
  "bg-rose-800/60",
  "bg-violet-800/60",
  "bg-orange-800/60",
  "bg-teal-800/60",
  "bg-pink-800/60",
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
  <div className="rounded-sm border border-border/40 bg-shelves-body p-5">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-sm bg-shelves-green/10 text-shelves-green">
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
      className="text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-shelves-blue"
    >
      {linkText}
    </Link>
  </div>
);

const BookCoverPlaceholder = ({ index }: { index: number }) => (
  <div
    className={`${PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]} group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-sm transition-transform hover:scale-105`}
  >
    <div className="absolute inset-0 flex items-end p-2 opacity-0 transition-opacity group-hover:opacity-100">
      <div className="w-full rounded-sm bg-black/70 px-2 py-1">
        <div className="h-2 w-3/4 rounded bg-foreground/30" />
        <div className="mt-1 h-1.5 w-1/2 rounded bg-foreground/20" />
      </div>
    </div>
  </div>
);

const ReviewCardPlaceholder = () => (
  <div className="rounded-sm border border-border/40 bg-shelves-body p-4">
    <div className="flex gap-3">
      <div className="h-20 w-14 flex-shrink-0 rounded-sm bg-secondary" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded bg-secondary" />
        <div className="h-2 w-1/2 rounded bg-secondary/60" />
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`star-${i + 1}`}
              className={`h-3 w-3 rounded-full ${i < 4 ? "bg-shelves-green/50" : "bg-secondary"}`}
            />
          ))}
        </div>
        <div className="space-y-1">
          <div className="h-2 w-full rounded bg-secondary/40" />
          <div className="h-2 w-5/6 rounded bg-secondary/40" />
        </div>
      </div>
    </div>
  </div>
);

const ListCardPlaceholder = () => (
  <div className="group cursor-pointer overflow-hidden rounded-sm border border-border/40 bg-shelves-body transition-colors hover:border-border">
    <div className="flex gap-0.5 p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`listcover-${i + 1}`}
          className={`${PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length]} aspect-[2/3] flex-1 rounded-sm`}
        />
      ))}
    </div>
    <div className="space-y-1 px-4 pb-4 pt-2">
      <div className="h-3 w-3/4 rounded bg-secondary" />
      <div className="h-2 w-1/2 rounded bg-secondary/60" />
    </div>
  </div>
);

/* ─── Page ─── */

const HomePage = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />

    {/* Hero */}
    <section className="relative overflow-hidden">
      {/* Backdrop: book cover collage */}
      <div className="absolute inset-0 z-0">
        <div className="grid h-full grid-cols-6 gap-1 opacity-20 sm:grid-cols-8 md:grid-cols-12">
          {SAMPLE_COVERS.map((book) => (
            <div
              key={book.id}
              className={`${book.color} aspect-[2/3]`}
              title={book.title}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-shelves-body/60 via-shelves-body/90 to-shelves-body" />
      </div>

      <div className="container relative z-10 flex flex-col items-center py-24 text-center md:py-32">
        <Image
          src="/logo.svg"
          alt="Shelves"
          width={80}
          height={80}
          className="mb-6"
        />
        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          Track books you&apos;ve read.
          <br />
          Save those you want to read.
          <br />
          <span className="text-shelves-green">
            Tell your friends what&apos;s good.
          </span>
        </h1>
        <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
          Shelves is a social platform for book lovers. Keep a reading diary,
          discover new books through people you trust, and build your literary
          identity.
        </p>
        <Link href="/sign-up" className="mt-8">
          <Button
            size="lg"
            className="bg-shelves-green px-8 text-base font-semibold text-shelves-body hover:bg-shelves-green/90"
          >
            Get started — it&apos;s free!
          </Button>
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">
          The social book tracker for readers who care about taste.
        </p>
      </div>
    </section>

    {/* Shelves lets you... */}
    <section className="border-y border-border/40 bg-shelves-surface">
      <div className="container py-16">
        <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-shelves-green">
          Shelves lets you...
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Eye className="h-5 w-5" />}
            title="Keep a reading diary"
            description="Log every book with dates, ratings, and private notes. Track your currently reading, want-to-read, and finished books."
          />
          <FeatureCard
            icon={<Star className="h-5 w-5" />}
            title="Rate and review"
            description="Rate on a 5-star scale with halves. Write reviews with spoiler tags. Build your taste identity over time."
          />
          <FeatureCard
            icon={<Users className="h-5 w-5" />}
            title="Follow readers you trust"
            description="Build a feed of people whose taste you admire. One friend's 5-star rating is worth more than any algorithm."
          />
          <FeatureCard
            icon={<List className="h-5 w-5" />}
            title="Create and share lists"
            description="Curate ranked and unranked book lists. The most shareable content unit — pull new readers in from social."
          />
          <FeatureCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Discover what to read"
            description="Browse by genre, mood, decade, or awards. See what your network loved. Never wonder what to read next."
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="See your reading stats"
            description="Books read, pages logged, top genres, reading pace. Annual Year in Review — shareable, beautiful, yours."
          />
        </div>
      </div>
    </section>

    {/* Popular this week */}
    <section className="container py-16">
      <SectionHeader
        label="Popular this week"
        href="/books/popular"
        linkText="More"
      />
      <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <BookCoverPlaceholder key={`popular-${i + 1}`} index={i} />
        ))}
      </div>
    </section>

    {/* Just reviewed */}
    <section className="border-y border-border/40 bg-shelves-surface">
      <div className="container py-16">
        <SectionHeader
          label="Just reviewed..."
          href="/books/reviewed"
          linkText="More"
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReviewCardPlaceholder key={`review-${i + 1}`} />
          ))}
        </div>
      </div>
    </section>

    {/* Popular lists */}
    <section className="container py-16">
      <SectionHeader
        label="Popular lists"
        href="/lists/popular"
        linkText="More"
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ListCardPlaceholder key={`list-${i + 1}`} />
        ))}
      </div>
    </section>

    {/* CTA banner */}
    <section className="border-t border-border/40 bg-shelves-surface">
      <div className="container flex flex-col items-center py-16 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">
          Join Shelves today.
        </h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          Import your Goodreads library in 3 clicks. Zero switching cost. Start
          building your reading identity.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-shelves-green px-8 font-semibold text-shelves-body hover:bg-shelves-green/90"
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
