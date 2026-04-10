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
  score: 0,
  upvotesCount: 0,
  downvotesCount: 0,
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
          score: 0,
          upvotesCount: 0,
          downvotesCount: 0,
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

    expect(screen.getByText("[deleted]")).toBeInTheDocument();
  });

  it("should show write a comment button when not showing input", () => {
    render(<CommentThread reviewId="r1" comments={[]} />);

    expect(screen.getByText("Write a comment...")).toBeInTheDocument();
  });

  it("should show textarea after clicking write a comment", async () => {
    useAuthStore.setState({
      session: { access_token: "token" } as never,
      profile: {
        username: "test",
        displayName: "Test",
        avatarUrl: null,
      } as never,
    });

    render(<CommentThread reviewId="r1" comments={[]} />);

    const { fireEvent, waitFor } = await import("@testing-library/react");
    fireEvent.click(screen.getByText("Write a comment..."));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("What are your thoughts?"),
      ).toBeInTheDocument();
    });
  });
});
