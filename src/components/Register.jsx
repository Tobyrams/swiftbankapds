import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Building2,
  CreditCard,
  IdCard,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    idNumber: "",
    accountNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Validate ID Number format
    if (!formData.idNumber.match(/^\d{13}$/)) {
      toast.error("ID Number must be exactly 13 digits");
      return;
    }

    // Validate Account Number format
    if (!formData.accountNumber.match(/^\d{9}$/)) {
      toast.error("Account Number must be exactly 9 digits");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Creating your account...");

    try {
      // 1. Register the user with Supabase Auth
      const { data: authData, error: authError } = await signUp(
        formData.email,
        formData.password
      );

      if (authError) throw authError;

      if (authData?.user?.id) {
        // 2. Create the bank profile
        const { error: profileError } = await supabase
          .from("bank_profiles")
          .insert({
            id: authData.user.id,
            full_name: formData.fullName,
            id_number: formData.idNumber,
            account_number: formData.accountNumber,
            email: formData.email,
          });

        if (profileError) {
          // If profile creation fails, we should clean up the auth user
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error(profileError.message);
        }

        toast.success("Account created successfully!", {
          id: loadingToast,
          icon: "🎉",
        });
        navigate("/");
      }
    } catch (error) {
      let errorMessage = "Failed to create account.";

      if (error.message.includes("duplicate key")) {
        if (error.message.includes("email")) {
          errorMessage = "This email is already registered.";
        } else if (error.message.includes("id_number")) {
          errorMessage = "This ID number is already registered.";
        } else if (error.message.includes("account_number")) {
          errorMessage = "This account number is already registered.";
        }
      }

      toast.error(errorMessage, {
        id: loadingToast,
      });
      console.error("Registration error:", error);
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
              Create Your Account
            </h1>
            <p className="text-base-content/70 mt-2">Join SecureBank today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="fullName">
                <span className="label-text flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input input-bordered"
                required
                placeholder="John Doe"
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="email">
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
              <label className="label" htmlFor="idNumber">
                <span className="label-text flex items-center gap-2">
                  <IdCard className="w-4 h-4" />
                  ID Number
                </span>
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                className="input input-bordered"
                required
                placeholder="Enter your ID number"
                pattern="\d{13}"
                title="ID Number must be exactly 13 digits"
                maxLength={13}
              />
              <label className="label" >
                <span className="label-text-alt text-base-content/70">
                  Must be exactly 13 digits
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label" htmlFor="accountNumber">
                <span className="label-text flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Account Number
                </span>
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="input input-bordered"
                required
                placeholder="Enter your account number"
                pattern="\d{9}"
                title="Account Number must be exactly 9 digits"
                maxLength={9}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/70">
                  Must be exactly 9 digits
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label" htmlFor="password">
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
                minLength={6}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/70">
                  Must be at least 6 characters
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label" htmlFor="confirmPassword">
                <span className="label-text flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input input-bordered"
                required
                placeholder="••••••••"
                minLength={6}
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
                  <UserPlus className="w-4 h-4" />
                )}
                Create Account
              </button>
            </div>

            <p className="text-center mt-6 text-sm sm:text-base">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
