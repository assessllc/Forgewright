import { Link, useLocation } from "wouter";
import { useOnboarding } from "@/hooks/useOnboarding";
import OnboardingTour from "@/components/OnboardingTour";
import WhatsNewBanner from "@/components/WhatsNewBanner";
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
  Network,
  AlertTriangle,
  Cpu,
  Stethoscope,
  BarChart2,
  Lightbulb,
  Library,
  HelpCircle,
  Settings,
  CreditCard,
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
  { href: "/app", label: "Home", icon: Home },
  { href: "/discovery", label: "Discovery", icon: MessageSquare },
  { href: "/scaffold", label: "Scaffold Builder", icon: Layers },
  { href: "/patterns", label: "Pattern Library", icon: BookOpen },
  { href: "/examples", label: "Example Library", icon: GitBranch },
  { href: "/reverse", label: "Reverse Mode", icon: FlipHorizontal },
  { href: "/swarm", label: "Swarm Composer", icon: Network },
  { href: "/antipatterns", label: "Anti-Patterns", icon: AlertTriangle },
  { href: "/models", label: "Model Guide", icon: Cpu },
  { href: "/sessions", label: "Sessions", icon: History },
  { href: "/diagnose", label: "Diagnose Output", icon: Stethoscope },
  { href: "/compare", label: "A/B Compare", icon: BarChart2 },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/diagnosis-library", label: "Diagnosis Library", icon: Library },
];

/** Secondary nav items shown below a divider — settings, help, pricing */
const SECONDARY_NAV_ITEMS = [
  { href: "/help", label: "Help & Glossary", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export default function AppLayout({ children, title, actions }: AppLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { showTour, showWhatsNew, completeTour, restartTour, dismissWhatsNew } = useOnboarding();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-14 lg:w-56 flex-shrink-0 border-r border-border bg-sidebar flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-3 lg:px-4 border-b border-sidebar-border">
          <Link href="/app" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="hidden lg:block font-semibold text-sm text-foreground truncate">
              Forgewright
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/app"
                ? location === "/app"
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

        {/* Secondary nav: Help, Settings, Pricing + divider */}
        <div className="py-2 px-2 border-t border-sidebar-border/50">
          {SECONDARY_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = location.startsWith(href);
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
          {/* Tour restart button — same style as nav items */}
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                onClick={restartTour}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                aria-label="Take the guided tour"
              >
                <Zap className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:block truncate">Take the tour</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="lg:hidden">
              Take the tour
            </TooltipContent>
          </Tooltip>
          <div className="hidden lg:block px-2 pt-2 pb-1">
            <span className="text-[10px] text-muted-foreground/30 tracking-wide font-medium">
              by ASSESS LLC
            </span>
          </div>
        </div>

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

      {/* Onboarding tour (driver.js, manages its own DOM) */}
      <OnboardingTour active={showTour} onFinish={completeTour} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* What's new banner — shown to returning users on new version */}
        {showWhatsNew && <WhatsNewBanner onDismiss={dismissWhatsNew} />}

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
