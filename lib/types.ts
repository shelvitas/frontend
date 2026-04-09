export interface FavouriteBook {
  id: string;
  slug?: string;
  title: string;
  coverUrl: string | null;
}

export interface PublicProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  profileVisibility: "public" | "private";
  isVerified: boolean;
  createdAt: string;

  followerCount: number;
  followingCount: number;
  booksReadCount: number;

  favouriteBooks: FavouriteBook[];

  isFollowing: boolean | null;
  isOwnProfile: boolean;
}

export interface LimitedProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  profileVisibility: "private";
  isVerified: boolean;

  followerCount: number;
  followingCount: number;

  isFollowing: boolean | null;
  isOwnProfile: false;
}

export type ProfileData = PublicProfile | LimitedProfile;

export function isFullProfile(profile: ProfileData): profile is PublicProfile {
  return "bio" in profile;
}

// ── Book Page ────────────────────────────────────────────────

export interface BookAuthor {
  id: string;
  slug?: string;
  name: string;
  role: string | null;
  bio: string | null;
  photoUrl: string | null;
  bookCount: number;
}

export interface BookReview {
  id: string;
  body: string;
  rating: number | null;
  containsSpoilers: boolean;
  isDnf: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  reviewer: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface BookSeries {
  id: string;
  slug?: string;
  name: string;
  position: string | null;
  totalBooks: number;
}

export interface UserBookStatus {
  status: "want_to_read" | "currently_reading" | "read" | "did_not_finish";
  rating: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  currentPage: number | null;
  currentPercent: number | null;
}

export interface BookPageData {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverUrl: string | null;
  isbn13: string | null;
  isbn10: string | null;
  pageCount: number | null;
  publisher: string | null;
  publishedDate: string | null;
  language: string | null;
  genre: string | null;

  avgRating: number | null;
  ratingsCount: number;
  reviewsCount: number;
  ratingHistogram: Record<string, number>;

  readingStats: Record<string, number>;

  authors: BookAuthor[];
  series: BookSeries | null;
  topReviews: BookReview[];
  userStatus: UserBookStatus | null;
}

// ── Diary ────────────────────────────────────────────────────

export interface DiaryEntry {
  id: string;
  userId: string;
  bookId: string;
  status: "want_to_read" | "currently_reading" | "read" | "did_not_finish";
  rating: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  currentPage: number | null;
  currentPercent: number | null;
  format: "physical" | "ebook" | "audiobook" | "borrowed" | null;
  edition: string | null;
  tags: string[] | null;
  privateNotes: string | null;
  isReread: boolean;
  createdAt: string;
  updatedAt: string;
  book: {
    id: string;
    slug?: string;
    title: string;
    coverUrl: string | null;
  };
}

// ── Review Page ──────────────────────────────────────────────

export interface ReviewPageData {
  id: string;
  bookId?: string;
  body: string;
  containsSpoilers: boolean;
  rating: string | null;
  isDnf: boolean;
  dnfPage: number | null;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  // Present on the canonical /v1/profile/:username/book/:bookSlug response
  book?: {
    id: string;
    slug: string;
    title: string;
    coverUrl: string | null;
  };
}

export interface CommentData {
  id: string;
  reviewId: string | null;
  shelfId: string | null;
  parentId: string | null;
  body: string;
  containsSpoilers: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  replies?: CommentData[];
}

// ── Shelf Page ───────────────────────────────────────────────

export interface ShelfBookItem {
  id: string;
  bookId: string;
  bookSlug?: string;
  title: string;
  coverUrl: string | null;
  position: number;
  notes: string | null;
  addedAt: string;
}

export interface ShelfPageData {
  id: string;
  slug: string;
  userId: string;
  title: string;
  description: string | null;
  isPrivate: boolean;
  isRanked: boolean;
  likesCount: number;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
  books: ShelfBookItem[];
  percentRead: number | null;
  isLiked: boolean;
}

// ── Feed ─────────────────────────────────────────────────────

export interface FeedEvent {
  id: string;
  eventType: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  book: {
    id: string;
    slug?: string;
    title: string;
    coverUrl: string | null;
  } | null;
  reviewId: string | null;
  shelfId: string | null;
  userBookId: string | null;
}

export interface FeedResponse {
  events: FeedEvent[];
  nextCursor: string | null;
}

export interface SocialRec {
  book: {
    id: string;
    slug?: string;
    title: string;
    coverUrl: string | null;
    avgRating: string | null;
    ratingsCount: number;
    genre: string | null;
    author: string | null;
  } | null;
  recommenderCount: number;
  networkAvgRating: string;
  recommenders: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    rating: string | null;
  }[];
}
