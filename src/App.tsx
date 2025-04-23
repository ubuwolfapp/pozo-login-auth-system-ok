import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import NotFound from "./pages/NotFound";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import WellDetails from "./pages/WellDetails";
import Cameras from "./pages/Cameras";
import Map from "./pages/Map";
import TaskHistory from "./pages/TaskHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/alerts" 
            element={
              <ProtectedRoute>
                <Alerts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wells/:id" 
            element={
              <ProtectedRoute>
                <WellDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cameras" 
            element={
              <ProtectedRoute>
                <Cameras />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/map" 
            element={
              <ProtectedRoute>
                <Map />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/task-history" 
            element={
              <ProtectedRoute>
                <TaskHistory />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
