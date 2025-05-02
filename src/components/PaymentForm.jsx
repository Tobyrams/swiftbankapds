import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initializePayment } from "../lib/paystack";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { Mail, User, DollarSign, Send } from "lucide-react";
import { verifyPayment } from "../lib/paystack";
import { supabase } from "../lib/supabase";

const PaymentForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    amount: "",
    recipientEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("initial");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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
      console.error("Payment error:", error);
      toast.error("An error occurred while processing your payment");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (reference) => {
    try {
      const response = await verifyPayment(reference);

      if (response.status) {
        const recipientEmail = localStorage.getItem("recipientEmail");
        if (recipientEmail) {
          const transactionData = {
            paystack_transaction_id: response.data.id,
            amount: response.data.amount / 100,
            currency: response.data.currency,
            status: response.data.status,
            customer_email: response.data.customer.email,
            customer_id: response.data.customer.id,
            metadata: {
              recipient_email: recipientEmail,
              reference: response.data.reference,
              channel: response.data.channel,
              paid_at: response.data.paid_at,
            },
          };

          // Check if transaction already exists
          const { data: existing, error: fetchError } = await supabase
            .from("transactions")
            .select("id")
            .eq("paystack_transaction_id", response.data.id)
            .maybeSingle();

          if (fetchError) {
            // Only show error if it's not a 'no rows found' error
            throw fetchError;
          }

          if (!existing) {
            // Insert only if not already present
            const { error: insertError } = await supabase
              .from("transactions")
              .insert(transactionData);
            if (insertError) throw insertError;
          }

          setVerificationStatus("success");
          if (!existing) {
            toast.success("Payment successful!");
          }
          localStorage.removeItem("recipientEmail");
        } else {
          setVerificationStatus("error");
          toast.error("Recipient information not found");
        }
      } else {
        setVerificationStatus("error");
        toast.error("Payment verification failed");
      }
    } catch (error) {
      // Only show error toast if not already successful
      if (verificationStatus !== "success") {
        setVerificationStatus("error");
        toast.error("An error occurred while verifying your payment");
      }
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
