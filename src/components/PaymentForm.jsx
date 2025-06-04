import React, { useState, useEffect } from "react";

import { initializePayment } from "../lib/paystack";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { Mail, User, DollarSign, Send } from "lucide-react";
import { supabase } from "../lib/supabase";

const PaymentForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    amount: "",
    recipientEmail: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const verifyRecipientEmail = async (email) => {
    const { data, error } = await supabase
      .from("bank_profiles")
      .select("email, full_name")
      .eq("email", email)
      .single();

    if (error) {
      throw new Error("Recipient not found in our system");
    }

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify recipient exists in bank_profiles
      const recipient = await verifyRecipientEmail(formData.recipientEmail);

      // Initialize payment
      const response = await initializePayment(formData.email, formData.amount);

      if (response.status) {
        // Store recipient email in localStorage for verification
        localStorage.setItem("recipientEmail", formData.recipientEmail);
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url;
      } else {
        toast.error("Failed to initialize payment");
      }
    } catch (error) {
      if (error.message === "Recipient not found in our system") {
        toast.error(
          "The recipient email is not registered in our system. Please ensure you have the correct email address."
        );
      } else {
        console.error("Payment error:", error);
        toast.error("An error occurred while processing your payment");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-base-100 rounded-2xl shadow-xl  border border-base-200">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-base-200 rounded-full p-4 mb-2 shadow">
          <Send className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-1">Send Money</h2>
        <p className="text-base-content/70 text-sm">
          Transfer funds securely to anyone
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-base-content mb-1 flex items-center gap-1">
            <Mail className="w-4 h-4" /> Your Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border border-base-200 bg-base-200 shadow-inner focus:border-primary focus:ring-primary px-3 py-2 text-base-content"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-base-content mb-1 flex items-center gap-1">
            <User className="w-4 h-4" /> Recipient Email
          </label>
          <input
            type="email"
            name="recipientEmail"
            value={formData.recipientEmail}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border border-base-200 bg-base-200 shadow-inner focus:border-primary focus:ring-primary px-3 py-2 text-base-content"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-base-content mb-1 flex items-center gap-1">
            <DollarSign className="w-4 h-4" /> Amount (ZAR)
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="1"
            className="mt-1 block w-full rounded-lg border border-base-200 bg-base-200 shadow-inner focus:border-primary focus:ring-primary px-3 py-2 text-base-content"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-lg shadow-md text-base font-semibold text-base-100 bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition"
        >
          <Send className="w-5 h-5" />
          {loading ? "Processing..." : "Proceed to Payment"}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
