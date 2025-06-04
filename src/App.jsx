import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "@fontsource/poppins";
import "daisyui/dist/full.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { LogOut, Building2, Send, History } from "lucide-react";

// Components
import Login from "./components/Login";
import PaymentForm from "./components/PaymentForm";
import PaymentVerification from "./components/PaymentVerification";
import Confirmation from "./components/Confirmation";
import Transactions from "./components/Transactions";

const themes = [
  { name: "Winter", value: "winter" },
  { name: "Light", value: "light" },
  { name: "Emerald", value: "emerald" },
  { name: "Forest", value: "forest" },
  { name: "Sunset", value: "sunset" },
  { name: "Black", value: "black" },
  { name: "Lofi", value: "lofi" },
];

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppContent() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "winter";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    const themeName =
      themes.find((t) => t.value === newTheme)?.name || newTheme;
    toast.success(`Theme changed to ${themeName}`, {
      icon: "🎨",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
      toast.success("Signed out successfully", {
        icon: "👋",
      });
    } catch (error) {
      toast.error("Failed to sign out");
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 ">
      {/* Navigation - Only shown when user is logged in */}
      {user && (
        <div className="navbar bg-base-100 shadow-lg px-4 sm:px-6 lg:px-8">
          <div className="flex-1">
            <Link
              to="/"
              className="text-xl font-semibold flex items-center gap-2"
            >
              <Building2 className="w-6 h-6" />
              <span className="hidden sm:inline">SecureBank</span>
            </Link>
          </div>
          <div className="flex-none gap-2 sm:gap-4">
            <div className="tabs tabs-boxed">
              <Link
                to="/"
                className={`tab ${
                  location.pathname === "/" ? "tab-active" : ""
                }`}
              >
                <Send className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Send Money</span>
              </Link>
              <Link
                to="/transactions"
                className={`tab ${
                  location.pathname === "/transactions" ? "tab-active" : ""
                }`}
              >
                <History className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Transactions</span>
              </Link>
            </div>
            <div className="form-control flex-row gap-2 items-center">
              <select
                className="select select-bordered select-sm max-w-[8rem] sm:max-w-xs"
                value={theme}
                onChange={handleThemeChange}
              >
                {themes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-sm hidden sm:inline">
                Welcome, {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="btn btn-ghost btn-sm gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PaymentForm />
              </ProtectedRoute>
            }
          />
          
          <Route path="/login" element={<Login />} />
          <Route
            path="/payment/verify"
            element={
              <ProtectedRoute>
                <PaymentVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmation"
            element={
              <ProtectedRoute>
                <Confirmation />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Toast Container */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 40,
        }}
        toastOptions={{
          duration: 4000,
          className: "text-sm sm:text-base",
          style: {
            background: "var(--fallback-b1,oklch(var(--b1)))",
            color: "var(--fallback-bc,oklch(var(--bc)))",
            maxWidth: "400px",
            padding: "16px",
          },
          success: {
            iconTheme: {
              primary: "var(--fallback-su,oklch(var(--su)))",
              secondary: "var(--fallback-suc,oklch(var(--suc)))",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--fallback-er,oklch(var(--er)))",
              secondary: "var(--fallback-erc,oklch(var(--erc)))",
            },
            duration: 5000,
          },
          loading: {
            duration: Infinity,
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
