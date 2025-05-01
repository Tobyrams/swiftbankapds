import React, { useState } from "react";

// Mock data - will be replaced with Supabase data
const mockTransactions = [
  {
    id: 1,
    amount: 1000,
    currency: "USD",
    sender: "John Doe",
    recipient: "Jane Smith",
    recipientAccount: "123456789",
    swiftCode: "BOFAUS3N",
    status: "pending",
    date: "2024-05-01",
  },
  {
    id: 2,
    amount: 2500,
    currency: "EUR",
    sender: "Alice Johnson",
    recipient: "Bob Wilson",
    recipientAccount: "987654321",
    swiftCode: "HSBCGB2L",
    status: "pending",
    date: "2024-05-01",
  },
];

export default function EmployeePortal() {
  const [transactions, setTransactions] = useState(mockTransactions);

  const handleVerify = (id) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status: "verified" } : tx))
    );
  };

  const handleSubmitToSwift = (id) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status: "submitted" } : tx))
    );
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto ">
        <h2 className="text-2xl font-bold mb-6 ">Employee Portal</h2>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Sender</th>
                <th>Recipient</th>
                <th>Account</th>
                <th>SWIFT Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.date}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.currency}</td>
                  <td>{transaction.sender}</td>
                  <td>{transaction.recipient}</td>
                  <td>{transaction.recipientAccount}</td>
                  <td>{transaction.swiftCode}</td>
                  <td>
                    <span
                      className={`badge ${
                        transaction.status === "pending"
                          ? "badge-warning"
                          : transaction.status === "verified"
                          ? "badge-info"
                          : "badge-success"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {transaction.status === "pending" && (
                        <button
                          onClick={() => handleVerify(transaction.id)}
                          className="btn btn-sm btn-info"
                        >
                          Verify
                        </button>
                      )}
                      {transaction.status === "verified" && (
                        <button
                          onClick={() => handleSubmitToSwift(transaction.id)}
                          className="btn btn-sm btn-success"
                        >
                          Submit to SWIFT
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
