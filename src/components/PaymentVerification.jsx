import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyPayment } from "../lib/paystack";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

const PaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    const verifyTransaction = async () => {
      const reference = searchParams.get("reference");
      console.log("Payment reference:", reference);

      if (!reference) {
        toast.error("No payment reference found");
        navigate("/payment");
        return;
      }

      try {
        console.log("Verifying payment with reference:", reference);
        const response = await verifyPayment(reference);
        console.log("Paystack verification response:", response);

        if (response.status) {
          const recipientEmail = localStorage.getItem("recipientEmail");
          console.log("Recipient email from localStorage:", recipientEmail);

          if (recipientEmail) {
            // Store transaction in Supabase
            const transactionData = {
              paystack_transaction_id: response.data.id,
              amount: response.data.amount / 100, // Convert from kobo to currency
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

            console.log(
              "Attempting to insert transaction into Supabase:",
              transactionData
            );

            // Check if transaction already exists
            const { data: existing, error: fetchError } = await supabase
              .from("transactions")
              .select("id")
              .eq("paystack_transaction_id", response.data.id)
              .single();

            if (fetchError && fetchError.code !== "PGRST116") {
              // Only throw if it's not a 'no rows found' error
              throw fetchError;
            }

            if (!existing) {
              // Insert only if not already present
              const { error: insertError } = await supabase
                .from("transactions")
                .insert(transactionData);
              if (insertError) throw insertError;
            }

            console.log("Transaction inserted successfully:");

            setVerificationStatus("success");
            toast.success("Payment successful!");
            localStorage.removeItem("recipientEmail");
          } else {
            console.error("No recipient email found in localStorage");
            setVerificationStatus("error");
            toast.error("Recipient information not found");
          }
        } else {
          console.error("Paystack verification failed:", response);
          setVerificationStatus("error");
          toast.error("Payment verification failed");
        }
      } catch (error) {
        console.error("Verification error details:", error);
        setVerificationStatus("error");
        toast.error("An error occurred while verifying your payment");
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
