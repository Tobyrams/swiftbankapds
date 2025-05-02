import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("customer_email", user.email)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();

      // Subscribe to real-time updates
      const subscription = supabase
        .channel("transactions_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "transactions",
            filter: `customer_email=eq.${user.email}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setTransactions((prev) => [payload.new, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              setTransactions((prev) =>
                prev.map((tx) => (tx.id === payload.new.id ? payload.new : tx))
              );
            } else if (payload.eventType === "DELETE") {
              setTransactions((prev) =>
                prev.filter((tx) => tx.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Transaction History</h2>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto ">
            <table className="table table-zebra  border border-base-300  w-full ">
              <thead className="bg-base-300">
                <tr>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Paystack Reference</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Recipient Email</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover ">
                    <td>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="font-mono">
                      {transaction.paystack_transaction_id}
                    </td>
                    <td className="font-mono">
                      {transaction.metadata?.reference || "-"}
                    </td>
                    <td>
                      {new Intl.NumberFormat("en-ZA", {
                        style: "currency",
                        currency: transaction.currency,
                      }).format(transaction.amount)}
                    </td>
                    <td>
                      <span
                        className={`badge  ${
                          transaction.status === "success"
                            ? "badge-success"
                            : transaction.status === "failed"
                            ? "badge-error"
                            : "badge-warning"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td>{transaction.metadata?.recipient_email || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
