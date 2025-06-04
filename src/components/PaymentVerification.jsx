import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyPayment } from "../lib/paystack";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

const PaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState("pending");

  const handleVerificationError = (error, message) => {
    setVerificationStatus("error");
    console.error("Verification error details:", error);
    toast.error(error?.message || message);
  };

  const checkTransactionExists = async (transactionId) => {
    const { data: existing, error: fetchError } = await supabase
      .from("transactions")
      .select("id")
      .eq("paystack_transaction_id", transactionId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    return existing;
  };

  const verifyRecipientEmail = async (email) => {
    const { data, error } = await supabase
      .from("bank_profiles")
      .select("email")
      .eq("email", email)
      .single();

    if (error) {
      throw new Error("Recipient not found in our system");
    }

    return data;
  };

  const insertTransaction = async (transactionData) => {
    const { error: insertError } = await supabase
      .from("transactions")
      .insert(transactionData);

    if (insertError) {
      // If it's a duplicate key error, we can treat it as success
      if (insertError.code === "23505") {
        // PostgreSQL unique violation code
        console.log("Transaction already exists, treating as success");
        return;
      }
      throw insertError;
    }
  };

  const processSuccessfulPayment = async (response) => {
    const recipientEmail = localStorage.getItem("recipientEmail");
    if (!recipientEmail) {
      throw new Error("No recipient email found");
    }

    // Verify recipient exists in bank_profiles
    await verifyRecipientEmail(recipientEmail);

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

    const existingTransaction = await checkTransactionExists(response.data.id);
    if (!existingTransaction) {
      await insertTransaction(transactionData);
    }

    localStorage.removeItem("recipientEmail");
    setVerificationStatus("success");
    toast.success("Payment successful!");
  };

  useEffect(() => {
    const verifyTransaction = async () => {
      const reference = searchParams.get("reference");
      if (!reference) {
        handleVerificationError(null, "No payment reference found");
        navigate("/payment");
        return;
      }

      try {
        const response = await verifyPayment(reference);
        // console.log("Payment verification response:", response);

        if (response.status) {
          await processSuccessfulPayment(response);
        } else {
          handleVerificationError(
            response,
            response.message || "Payment verification failed"
          );
        }
      } catch (error) {
        // console.error("Verification error:", error);
        handleVerificationError(
          error,
          error.message || "An error occurred while verifying your payment"
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyTransaction();
  }, [searchParams, navigate]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Payment Verification
      </h2>

      {verifying ? (
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Verifying your payment...</p>
        </div>
      ) : (
        <div className="text-center">
          {verificationStatus === "success" ? (
            <>
              <div className="text-green-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold mb-4">Payment Successful!</p>
              <p className="text-gray-600 mb-6">
                Your payment has been processed successfully.
              </p>
            </>
          ) : (
            <>
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold mb-4">Payment Failed</p>
              <p className="text-gray-600 mb-6">
                There was an issue processing your payment. Please try again.
              </p>
            </>
          )}
          <button
            onClick={() => navigate("/payment")}
            className="btn btn-primary"
          >
            Return to Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
