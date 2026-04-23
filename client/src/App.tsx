import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import AppHome from "./pages/AppHome";
import Discovery from "./pages/Discovery";
import ScaffoldBuilder from "./pages/ScaffoldBuilder";
import Variants from "./pages/Variants";
import ReverseMode from "./pages/ReverseMode";
import PatternLibrary from "./pages/PatternLibrary";
import Sessions from "./pages/Sessions";
import ExampleLibrary from "./pages/ExampleLibrary";
import SwarmComposer from "./pages/SwarmComposer";
import AntiPatternLibrary from "./pages/AntiPatternLibrary";
import ModelGuide from "./pages/ModelGuide";
import Diagnose from "./pages/Diagnose";
import Compare from "./pages/Compare";
import Insights from "./pages/Insights";
import ScaffoldDiff from "./pages/ScaffoldDiff";
import DiagnosisLibrary from "@/pages/DiagnosisLibrary";
import Settings from "@/pages/Settings";
import Pricing from "@/pages/Pricing";
import Help from "@/pages/Help";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import SecurityPage from "@/pages/Security";
import Contact from "@/pages/Contact";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/app" component={AppHome} />
      <Route path="/discovery" component={Discovery} />
      <Route path="/scaffold" component={ScaffoldBuilder} />
      <Route path="/scaffold/:sessionId" component={ScaffoldBuilder} />
      <Route path="/variants/:sessionId" component={Variants} />
      <Route path="/reverse" component={ReverseMode} />
      <Route path="/patterns" component={PatternLibrary} />
      <Route path="/sessions" component={Sessions} />
      <Route path="/examples" component={ExampleLibrary} />
      <Route path="/swarm" component={SwarmComposer} />
      <Route path="/antipatterns" component={AntiPatternLibrary} />
      <Route path="/models" component={ModelGuide} />
      <Route path="/diagnose" component={Diagnose} />
      <Route path="/compare" component={Compare} />
      <Route path="/insights" component={Insights} />
      <Route path="/session/:sessionId/diff/:versionA/:versionB" component={ScaffoldDiff} />
      <Route path="/diagnosis-library" component={DiagnosisLibrary} />
      <Route path="/settings" component={Settings} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/help" component={Help} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/security" component={SecurityPage} />
      <Route path="/contact" component={Contact} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
