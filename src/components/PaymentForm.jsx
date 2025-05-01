import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  CreditCard,
  User,
  Mail,
  DollarSign,
  Building,
  FileText,
  Send,
  History,
  BadgeDollarSign,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function PaymentForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("payment");
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    recipientName: "",
    recipientAccount: "",
    swiftCode: "",
    bankName: "",
    reference: "",
  });

  const currencies = ["USD", "EUR", "GBP", "JPY", "AUD"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Processing payment...");

    try {
      // TODO: Implement actual payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      toast.success("Payment processed successfully!", { id: loadingToast });
      navigate("/confirmation");
    } catch (error) {
      toast.error("Payment failed. Please try again.", { id: loadingToast });
      console.error("Payment error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Mock user data - replace with actual data from your auth context
  const userData = {
    accountNumber: "12345678",
    idNumber: "ID8765321",
    email: user?.email || "john.doe@example.com",
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* User Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="text-sm font-medium text-base-content/70 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Account Number
            </h3>
            <p className="text-xl font-semibold">{userData.accountNumber}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="text-sm font-medium text-base-content/70 flex items-center gap-2">
              <User className="w-4 h-4" />
              ID Number
            </h3>
            <p className="text-xl font-semibold">{userData.idNumber}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="text-sm font-medium text-base-content/70 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </h3>
            <p className="text-xl font-semibold">{userData.email}</p>
          </div>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex space-x-2">
        <button
          className={`btn ${
            activeTab === "payment" ? "btn-primary" : "btn-ghost"
          } gap-2`}
          onClick={() => setActiveTab("payment")}
        >
          <Send className="w-4 h-4" />
          Make Payment
        </button>
        <button
          className={`btn ${
            activeTab === "history" ? "btn-primary" : "btn-ghost"
          } gap-2`}
          onClick={() => setActiveTab("history")}
        >
          <History className="w-4 h-4" />
          Transaction History
        </button>
      </div>

      {/* Content Section */}
      {activeTab === "payment" ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Make a Payment</h2>
            <p className="text-base-content/70">
              Send money internationally using SWIFT
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Amount
                    </span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <BadgeDollarSign className="w-4 h-4" />
                      Currency
                    </span>
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="select select-bordered"
                    required
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency} -{" "}
                        {currency === "USD" ? "US Dollar" : currency}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Recipient Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    placeholder="John Doe"
                    value={formData.recipientName}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Recipient Account Number
                    </span>
                  </label>
                  <input
                    type="text"
                    name="recipientAccount"
                    placeholder="12345678"
                    value={formData.recipientAccount}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      SWIFT Code
                    </span>
                  </label>
                  <input
                    type="text"
                    name="swiftCode"
                    placeholder="BOFAUS3N"
                    value={formData.swiftCode}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                    pattern="[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Bank Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    placeholder="Bank of America"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Reference (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  name="reference"
                  placeholder="Invoice #12345"
                  value={formData.reference}
                  onChange={handleChange}
                  className="input input-bordered"
                />
              </div>

              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary w-full gap-2">
                  <Send className="w-4 h-4" />
                  Pay Now
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <History className="w-5 h-5" />
              Transaction History
            </h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Date
                    </th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2024-03-10</td>
                    <td>Payment to John Doe</td>
                    <td>$1,000.00</td>
                    <td>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="badge badge-success">Completed</span>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>2024-03-09</td>
                    <td>Payment to Jane Smith</td>
                    <td>$750.00</td>
                    <td>
                      <span className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-error" />
                        <span className="badge badge-error">Failed</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
