import { Link, useRouterState } from '@tanstack/react-router';
import LoginButton from './LoginButton';
import { TrendingUp, ShoppingBag } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(window.location.hostname || 'stock-sphere');
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isMarketplaceActive = currentPath.startsWith('/marketplace') || currentPath.startsWith('/course') || currentPath.startsWith('/create-course');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
              <TrendingUp className="h-6 w-6 text-[oklch(0.55_0.15_140)]" />
              <span className="bg-gradient-to-r from-[oklch(0.35_0.08_60)] to-[oklch(0.45_0.12_80)] bg-clip-text text-transparent">
                Stock Sphere
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPath === '/'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                Feed
              </Link>
              <Link
                to="/marketplace"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isMarketplaceActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                Marketplace
              </Link>
            </nav>
          </div>
          <LoginButton />
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-muted/30 py-8 mt-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Stock Sphere. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with <span className="text-red-500">♥</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
