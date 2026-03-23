import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";

const NotFound = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex flex-1 flex-col items-center justify-center gap-3">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h1 className="text-xl font-bold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button
        asChild
        className="mt-2 bg-shelves-green font-semibold text-background hover:bg-shelves-green/90"
      >
        <Link href="/">Go home</Link>
      </Button>
    </main>
  </div>
);

export default NotFound;
