import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  MessageSquare,
  Layers,
  GitBranch,
  FlipHorizontal,
  BookOpen,
  History,
  Zap,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discovery", label: "Discovery", icon: MessageSquare },
  { href: "/scaffold", label: "Scaffold Builder", icon: Layers },
  { href: "/patterns", label: "Pattern Library", icon: BookOpen },
  { href: "/examples", label: "Example Library", icon: GitBranch },
  { href: "/reverse", label: "Reverse Mode", icon: FlipHorizontal },
  { href: "/sessions", label: "Sessions", icon: History },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export default function AppLayout({ children, title, actions }: AppLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-14 lg:w-56 flex-shrink-0 border-r border-border bg-sidebar flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-3 lg:px-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="hidden lg:block font-semibold text-sm text-foreground truncate">
              Prompitect
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/"
                ? location === "/"
                : location.startsWith(href);
            return (
              <Tooltip key={href} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link href={href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden lg:block truncate">{label}</span>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-2 border-t border-sidebar-border">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-primary">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="hidden lg:flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-foreground truncate">
                  {user?.name ?? "User"}
                </span>
                <button
                  onClick={() => logout()}
                  className="text-xs text-muted-foreground hover:text-foreground text-left transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sidebar-foreground hover:text-foreground"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  <div className="w-4 h-4 rounded-full border border-muted-foreground flex-shrink-0" />
                  <span className="hidden lg:block text-xs">Sign in</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">
                Sign in
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        {(title || actions) && (
          <header className="h-14 border-b border-border flex items-center px-4 gap-4 flex-shrink-0">
            {title && (
              <h1 className="text-sm font-semibold text-foreground truncate">
                {title}
              </h1>
            )}
            {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
          </header>
        )}

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
