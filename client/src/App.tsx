import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Shirt } from "lucide-react";
import NotFound from "@/pages/not-found";
import IndustrySelection from "@/pages/industry-selection";
import OutfitUpload from "@/pages/outfit-upload";
import Results from "@/pages/results";

function Router() {
  return (
    <Switch>
      <Route path="/" component={IndustrySelection} />
      <Route path="/upload/:industry" component={OutfitUpload} />
      <Route path="/results/:industry" component={Results} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-gray-50 font-sans text-gray-800 min-h-screen">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {/* App Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Outfit Compliance Checker</h1>
                <p className="text-gray-600 mt-1">Verify your attire meets industry standards</p>
              </div>
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-3 rounded-lg shadow-md mr-3">
                  <Shirt className="w-5 h-5" />
                </div>
                <div className="font-bold text-xl bg-gradient-to-r from-blue-700 to-blue-500 text-transparent bg-clip-text">
                  Dress Check
                </div>
              </div>
            </div>
          </header>

          <Router />

          {/* Footer */}
          <footer className="mt-12 text-center text-gray-500 text-sm">
            <p>Outfit Compliance Checker &copy; {new Date().getFullYear()} | <a href="#" className="text-primary hover:underline">Privacy Policy</a> | <a href="#" className="text-primary hover:underline">Terms of Service</a></p>
          </footer>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
