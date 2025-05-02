import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyPayment } from "../lib/paystack";
import { toast } from "react-hot-toast";

const PaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    const verifyTransaction = async () => {
      const reference = searchParams.get("reference");
      if (!reference) {
        toast.error("No payment reference found");
        navigate("/payment");
        return;
      }

      try {
        const response = await verifyPayment(reference);

        if (response.status) {
          const recipientEmail = localStorage.getItem("recipientEmail");
          if (recipientEmail) {
            // Here you would typically update your database with the transaction details
            // and handle the transfer to the recipient
            console.log("Payment successful:", {
              amount: response.data.amount / 100,
              recipientEmail,
              reference: response.data.reference,
            });

            setVerificationStatus("success");
            toast.success("Payment successful!");
          } else {
            setVerificationStatus("error");
            toast.error("Recipient information not found");
          }
        } else {
          setVerificationStatus("error");
          toast.error("Payment verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
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
