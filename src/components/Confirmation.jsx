import React from "react";
import { Link } from "react-router-dom";

export default function Confirmation() {
  // In a real app, this would come from the payment form or API response
  const paymentDetails = {
    amount: 1000,
    currency: "USD",
    recipientName: "Jane Smith",
    recipientAccount: "123456789",
    swiftCode: "BOFAUS3N",
    transactionId: "TX123456789",
    date: new Date().toLocaleDateString(),
    status: "Pending Verification",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold">
              Payment Submitted Successfully
            </h2>
            <p className="text-gray-500">Your payment is being processed</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-semibold">Transaction ID:</span>
              <span>{paymentDetails.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Date:</span>
              <span>{paymentDetails.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Amount:</span>
              <span>
                {paymentDetails.amount} {paymentDetails.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Recipient:</span>
              <span>{paymentDetails.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Account Number:</span>
              <span>{paymentDetails.recipientAccount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">SWIFT Code:</span>
              <span>{paymentDetails.swiftCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Status:</span>
              <span className="badge badge-warning">
                {paymentDetails.status}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <p className="text-sm text-gray-500">
              Your payment has been submitted and is awaiting verification by
              our team. You will receive a confirmation email once the payment
              is processed.
            </p>

            <div className="flex justify-center gap-4">
              <Link to="/payment" className="btn btn-primary">
                Make Another Payment
              </Link>
              <Link to="/" className="btn btn-ghost">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
