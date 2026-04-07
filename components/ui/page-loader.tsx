export const PageLoader = () => (
  <div className="flex w-full flex-col items-center">
    <div
      className="relative ml-16 h-[160px] w-[130px]"
      style={{ perspective: "800px" }}
    >
      {/* Book base — right side (always visible) */}
      <div className="absolute inset-0 rounded-r-md border border-secondary/40 bg-secondary/20" />

      {/* Text lines on base page */}
      <div className="absolute right-3 top-5 flex flex-col gap-2">
        <div className="h-[2px] w-10 rounded bg-muted-foreground/15" />
        <div className="bg-muted-foreground/12 h-[2px] w-8 rounded" />
        <div className="h-[2px] w-10 rounded bg-muted-foreground/10" />
        <div className="bg-muted-foreground/8 h-[2px] w-6 rounded" />
        <div className="h-[2px] w-9 rounded bg-muted-foreground/10" />
        <div className="bg-muted-foreground/8 h-[2px] w-7 rounded" />
      </div>

      {/* Page 3 (deepest) */}
      <div
        className="absolute inset-0 origin-left rounded-r-md border border-secondary/30 bg-secondary/15"
        style={{
          animation: "pageFlip 2.4s ease-in-out 0.8s infinite",
          transformStyle: "preserve-3d",
        }}
      />

      {/* Page 2 */}
      <div
        className="absolute inset-0 origin-left rounded-r-md border border-secondary/30 bg-secondary/20"
        style={{
          animation: "pageFlip 2.4s ease-in-out 0.4s infinite",
          transformStyle: "preserve-3d",
        }}
      />

      {/* Page 1 (top) */}
      <div
        className="absolute inset-0 origin-left rounded-r-md border border-secondary/40 bg-secondary/25"
        style={{
          animation: "pageFlip 2.4s ease-in-out 0s infinite",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Text lines on flipping page */}
        <div className="absolute left-3 top-5 flex flex-col gap-2">
          <div className="h-[2px] w-10 rounded bg-muted-foreground/15" />
          <div className="bg-muted-foreground/12 h-[2px] w-7 rounded" />
          <div className="h-[2px] w-10 rounded bg-muted-foreground/10" />
          <div className="bg-muted-foreground/8 h-[2px] w-5 rounded" />
        </div>
      </div>

      {/* Spine shadow */}
      <div className="absolute inset-y-0 left-0 w-[3px] rounded-l bg-shelvitas-green/20" />
    </div>

    <style
      dangerouslySetInnerHTML={{
        __html: `
          @keyframes pageFlip {
            0% { transform: rotateY(0deg); }
            20% { transform: rotateY(-160deg); }
            40%, 100% { transform: rotateY(-160deg); opacity: 0; }
          }
        `,
      }}
    />
  </div>
);
