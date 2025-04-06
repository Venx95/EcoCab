
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthProvider from "./providers/AuthProvider";
import RidesProvider from "./providers/RidesProvider";
import AppShell from "./components/layout/AppShell";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import RegisterRide from "./pages/RegisterRide";
import BookRide from "./pages/BookRide";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import EditProfile from "./pages/EditProfile";
import RequireAuth from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RidesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppShell>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <RequireAuth>
                    <Index />
                  </RequireAuth>
                } />
                <Route path="/profile" element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                } />
                <Route path="/edit-profile" element={
                  <RequireAuth>
                    <EditProfile />
                  </RequireAuth>
                } />
                <Route path="/register-ride" element={
                  <RequireAuth>
                    <RegisterRide />
                  </RequireAuth>
                } />
                <Route path="/book-ride" element={
                  <RequireAuth>
                    <BookRide />
                  </RequireAuth>
                } />
                <Route path="/messages" element={
                  <RequireAuth>
                    <Messages />
                  </RequireAuth>
                } />
                <Route path="/settings" element={
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                } />
                
                {/* Redirect to login by default */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppShell>
          </BrowserRouter>
        </TooltipProvider>
      </RidesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
