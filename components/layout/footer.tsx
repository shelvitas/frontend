import Link from "next/link";
import Image from "next/image";

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <li>
    <Link
      href={href}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  </li>
);

export const Footer = () => (
  <footer className="border-t border-border/40 bg-shelves-header">
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-4">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Shelves" width={24} height={24} />
            <span className="font-bold text-foreground">Shelves</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Track books you&apos;ve read. Save those you want to read. Tell your
            friends what&apos;s good.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Browse
          </h4>
          <ul className="space-y-2">
            <FooterLink href="/books">Books</FooterLink>
            <FooterLink href="/lists">Lists</FooterLink>
            <FooterLink href="/members">Members</FooterLink>
            <FooterLink href="/journal">Journal</FooterLink>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Product
          </h4>
          <ul className="space-y-2">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/pro">Pro</FooterLink>
            <FooterLink href="/apps">Apps</FooterLink>
            <FooterLink href="/help">Help</FooterLink>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Legal
          </h4>
          <ul className="space-y-2">
            <FooterLink href="/terms">Terms of Use</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/api">API</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </ul>
        </div>
      </div>

      <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Shelves. Made for book lovers.
      </div>
    </div>
  </footer>
);
