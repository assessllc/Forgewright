import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
