export interface FavouriteBook {
  id: string;
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
