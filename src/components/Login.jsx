import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { LogIn, Mail, Lock, Building2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Signing in...");

    try {
      const { error: signInError } = await signIn(
        formData.email,
        formData.password
      );

      if (signInError) throw signInError;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("bank_profiles")
        .select("*")
        .eq("email", formData.email)
        .single();

      if (profileError) {
        throw new Error("Could not fetch user profile");
      }

      toast.success(`Welcome back, ${profile.full_name}!`, {
        id: loadingToast,
        icon: "👋",
        duration: 5000,
      });

      navigate("/");
    } catch (error) {
      let errorMessage = "Failed to sign in.";

      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email address.";
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Too many attempts. Please try again later.";
      }

      toast.error(errorMessage, {
        id: loadingToast,
        duration: 5000,
      });
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl ring-2 ring-base-300">
        <div className="card-body p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <Building2 className="w-12 h-12 mb-2" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome to SecureBank
            </h1>
            <p className="text-base-content/70 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered"
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered"
                required
                placeholder="••••••••"
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                Sign In
              </button>
            </div>

            <p className="text-center mt-6 text-sm sm:text-base">
              Don't have an account?{" "}
              <Link to="/register" className="link link-primary">
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
