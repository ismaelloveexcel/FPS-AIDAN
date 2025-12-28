import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Game from "@/pages/Game";
import AssetGenerator from "@/pages/AssetGenerator";
import AssetManager from "@/pages/AssetManager";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Game} />
      <Route path="/assets" component={AssetGenerator} />
      <Route path="/asset-manager" component={AssetManager} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
