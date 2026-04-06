"use client";

import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  url: string;
  text: string;
}

export const ShareButtons = ({ url, text }: ShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        <Share2 className="mr-1 inline h-3 w-3" />
        Share
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground"
        >
          X
        </Button>
      </a>
      <a
        href={`https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground"
        >
          Threads
        </Button>
      </a>
    </div>
  );
};
