
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RegisterRide from "./pages/RegisterRide";
import BookRide from "./pages/BookRide";
import Messages from "./pages/Messages";
import Conversation from "./pages/Conversation";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import BookingDetails from "./pages/BookingDetails";
import NotFound from "./pages/NotFound";
import AppShell from "./components/layout/AppShell";
import AuthProvider from "./providers/AuthProvider";
import RidesProvider from "./providers/RidesProvider";
import RequireAuth from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster position="top-center" />
        <BrowserRouter>
          <AuthProvider>
            <RidesProvider>
              <AppShell>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route 
                    path="/register-ride" 
                    element={
                      <RequireAuth>
                        <RegisterRide />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/book-ride" 
                    element={
                      <RequireAuth>
                        <BookRide />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/messages" 
                    element={
                      <RequireAuth>
                        <Messages />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/conversation/:id" 
                    element={
                      <RequireAuth>
                        <Conversation />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <RequireAuth>
                        <Profile />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/edit-profile" 
                    element={
                      <RequireAuth>
                        <EditProfile />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <RequireAuth>
                        <Settings />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/booking-details/:id" 
                    element={
                      <RequireAuth>
                        <BookingDetails />
                      </RequireAuth>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppShell>
            </RidesProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
