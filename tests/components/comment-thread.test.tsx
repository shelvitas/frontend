import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { useAuthStore } from "@/store/auth";
import type { CommentData } from "@/lib/types";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  }),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const { CommentThread } = await import("@/components/review/comment-thread");

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    session: null,
    user: null,
    profile: null,
    isLoading: false,
  });
});

const baseComment: CommentData = {
  id: "c1",
  reviewId: "r1",
  shelfId: null,
  parentId: null,
  body: "This is a great review!",
  containsSpoilers: false,
  isDeleted: false,
  createdAt: "2024-01-15T00:00:00.000Z",
  updatedAt: "2024-01-15T00:00:00.000Z",
  author: {
    username: "commenter",
    displayName: "Comment User",
    avatarUrl: null,
  },
  replies: [],
};

describe("CommentThread", () => {
  it("should render comments", () => {
    render(<CommentThread reviewId="r1" comments={[baseComment]} />);

    expect(screen.getByText("Comment User")).toBeInTheDocument();
    expect(screen.getByText("This is a great review!")).toBeInTheDocument();
  });

  it("should show empty state when no comments", () => {
    render(<CommentThread reviewId="r1" comments={[]} />);

    expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
  });

  it("should show Reply button for top-level comments", () => {
    render(<CommentThread reviewId="r1" comments={[baseComment]} />);

    expect(screen.getByText("Reply")).toBeInTheDocument();
  });

  it("should render nested replies", () => {
    const withReply: CommentData = {
      ...baseComment,
      replies: [
        {
          id: "c2",
          reviewId: "r1",
          shelfId: null,
          parentId: "c1",
          body: "I agree!",
          containsSpoilers: false,
          isDeleted: false,
          createdAt: "2024-01-16T00:00:00.000Z",
          updatedAt: "2024-01-16T00:00:00.000Z",
          author: {
            username: "replier",
            displayName: "Reply User",
            avatarUrl: null,
          },
        },
      ],
    };

    render(<CommentThread reviewId="r1" comments={[withReply]} />);

    expect(screen.getByText("I agree!")).toBeInTheDocument();
    expect(screen.getByText("Reply User")).toBeInTheDocument();
  });

  it("should show spoiler toggle for spoiler comments", () => {
    const spoilerComment: CommentData = {
      ...baseComment,
      containsSpoilers: true,
    };

    render(<CommentThread reviewId="r1" comments={[spoilerComment]} />);

    expect(screen.getByText("Show spoiler")).toBeInTheDocument();
    expect(
      screen.queryByText("This is a great review!"),
    ).not.toBeInTheDocument();
  });

  it("should show deleted placeholder", () => {
    const deletedComment: CommentData = {
      ...baseComment,
      body: "[This comment has been deleted]",
      isDeleted: true,
    };

    render(<CommentThread reviewId="r1" comments={[deletedComment]} />);

    expect(
      screen.getByText("[This comment has been deleted]"),
    ).toBeInTheDocument();
    expect(screen.getByText("deleted")).toBeInTheDocument();
  });

  it("should show sign-in prompt in placeholder when not authenticated", () => {
    render(<CommentThread reviewId="r1" comments={[]} />);

    expect(
      screen.getByPlaceholderText("Sign in to comment"),
    ).toBeInTheDocument();
  });

  it("should show write prompt when authenticated", () => {
    useAuthStore.setState({ session: { access_token: "token" } as never });

    render(<CommentThread reviewId="r1" comments={[]} />);

    expect(
      screen.getByPlaceholderText("Write a comment..."),
    ).toBeInTheDocument();
  });
});
