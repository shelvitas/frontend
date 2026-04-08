import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => 
    // Render everything including unoptimized so tests can assert on it.
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
     (
      <img
        data-testid="next-image"
        data-unoptimized={props.unoptimized ? "true" : "false"}
        src={props.src as string}
        alt={props.alt as string}
        width={props.width as number}
        height={props.height as number}
        className={props.className as string}
      />
    )
  ,
}));

const { RemoteImage } = await import("@/components/ui/remote-image");

describe("RemoteImage", () => {
  it("should render an image element", () => {
    render(
      <RemoteImage
        src="https://example.com/foo.jpg"
        alt="foo"
        width={100}
        height={100}
      />,
    );

    expect(screen.getByTestId("next-image")).toBeInTheDocument();
  });

  it("should pass src, alt, width, and height through", () => {
    render(
      <RemoteImage
        src="https://books.google.com/book.jpg"
        alt="Book cover"
        width={120}
        height={180}
      />,
    );

    const img = screen.getByTestId("next-image");
    expect(img).toHaveAttribute("src", "https://books.google.com/book.jpg");
    expect(img).toHaveAttribute("alt", "Book cover");
    expect(img).toHaveAttribute("width", "120");
    expect(img).toHaveAttribute("height", "180");
  });

  it("should mark non-whitelisted URLs as unoptimized", () => {
    render(
      <RemoteImage
        src="https://notwhitelisted.example/image.jpg"
        alt="x"
        width={50}
        height={50}
      />,
    );

    expect(screen.getByTestId("next-image")).toHaveAttribute(
      "data-unoptimized",
      "true",
    );
  });

  it("should mark books.google.com URLs as optimized (whitelisted)", () => {
    render(
      <RemoteImage
        src="https://books.google.com/cover.jpg"
        alt="x"
        width={50}
        height={50}
      />,
    );

    expect(screen.getByTestId("next-image")).toHaveAttribute(
      "data-unoptimized",
      "false",
    );
  });

  it("should mark covers.openlibrary.org URLs as optimized", () => {
    render(
      <RemoteImage
        src="https://covers.openlibrary.org/b/id/1.jpg"
        alt="x"
        width={50}
        height={50}
      />,
    );

    expect(screen.getByTestId("next-image")).toHaveAttribute(
      "data-unoptimized",
      "false",
    );
  });

  it("should mark supabase.co URLs as optimized", () => {
    render(
      <RemoteImage
        src="https://project.supabase.co/storage/v1/object/public/avatar.png"
        alt="avatar"
        width={50}
        height={50}
      />,
    );

    expect(screen.getByTestId("next-image")).toHaveAttribute(
      "data-unoptimized",
      "false",
    );
  });

  it("should mark googleusercontent.com URLs as optimized", () => {
    render(
      <RemoteImage
        src="https://lh3.googleusercontent.com/a/example"
        alt="avatar"
        width={50}
        height={50}
      />,
    );

    expect(screen.getByTestId("next-image")).toHaveAttribute(
      "data-unoptimized",
      "false",
    );
  });

  it("should pass className through", () => {
    render(
      <RemoteImage
        src="https://example.com/img.jpg"
        alt="x"
        width={50}
        height={50}
        className="rounded-lg"
      />,
    );

    expect(screen.getByTestId("next-image")).toHaveClass("rounded-lg");
  });
});
