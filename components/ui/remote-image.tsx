import Image from "next/image";

interface RemoteImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

/**
 * Next.js Image wrapper for external/dynamic URLs.
 * Uses unoptimized for URLs outside our whitelisted domains.
 * Provides proper lazy loading, sizing, and alt text.
 */
export const RemoteImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority,
}: RemoteImageProps) => {
  const isWhitelisted =
    src.includes("googleusercontent.com") ||
    src.includes("supabase.co") ||
    src.includes("covers.openlibrary.org") ||
    src.includes("books.google.com");

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized={!isWhitelisted}
    />
  );
};
