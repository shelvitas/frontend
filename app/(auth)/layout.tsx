import Link from "next/link";
import Image from "next/image";

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col">
    {/* Minimal header — just logo */}
    <header className="container flex h-14 items-center">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.svg" alt="Shelves" width={28} height={28} />
        <span className="text-lg font-bold tracking-tight text-foreground">
          Shelves
        </span>
      </Link>
    </header>

    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">{children}</div>
    </main>

    <footer className="container py-6 text-center text-xs text-muted-foreground">
      &copy; {new Date().getFullYear()} Shelves. Made for book lovers.
    </footer>
  </div>
);

export default AuthLayout;
