import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
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

// Currency list with codes and names
const currencies = [
  { code: "ZAR", name: "South African Rand" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound Sterling" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "AED", name: "UAE Dirham" },
  { code: "INR", name: "Indian Rupee" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "KRW", name: "South Korean Won" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "SAR", name: "Saudi Riyal" },
];

// South African banks list
const saBanks = [
  "ABSA Bank",
  "African Bank",
  "Bidvest Bank",
  "Capitec Bank",
  "Discovery Bank",
  "First National Bank (FNB)",
  "Investec Bank",
  "Nedbank",
  "Standard Bank",
  "TymeBank",
  "Ubank",
  "Sasfin Bank",
  "Grindrod Bank",
  "Mercantile Bank",
  "Access Bank South Africa",
  "Bank Zero",
  "Bank of Athens",
  "HBZ Bank",
  "Habib Overseas Bank",
  "State Bank of India South Africa",
];

export default function PaymentForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("payment");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "",
    recipientName: "",
    recipientAccount: "",
    swiftCode: "",
    bankName: "",
    reference: "",
  });

  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return "Not available";
    // Format: 00 000 000 0
    return accountNumber.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1 $2 $3 $4");
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("bank_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

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

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* User Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow ring-2 ring-base-300">
          <div className="card-body">
            <h3 className="text-sm font-medium text-base-content/70 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Account Number
            </h3>
            <p className="text-xl font-semibold">
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                formatAccountNumber(userProfile?.account_number)
              )}
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow ring-2 ring-base-300">
          <div className="card-body">
            <h3 className="text-sm font-medium text-base-content/70 flex items-center gap-2">
              <User className="w-4 h-4" />
              ID Number
            </h3>
            <p className="text-xl font-semibold">
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                userProfile?.id_number || "Not available"
              )}
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow ring-2 ring-base-300">
          <div className="card-body">
            <h3 className="text-sm font-medium text-base-content/70 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </h3>
            <p className="text-xl font-semibold">
              {user?.email || "Not available"}
            </p>
          </div>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex space-x-2 ">
        <div className="bg-base-300 p-2 rounded gap-2 flex ring-2 ring-primary/40">
          <button
            className={`btn  ${
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
      </div>

      {/* Content Section */}
      {activeTab === "payment" ? (
        <div className="card bg-base-100 shadow-xl ring-2 ring-base-300">
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
                  <input
                    list="currencies"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="input input-bordered"
                    placeholder="Search currency..."
                    required
                  />
                  <datalist id="currencies">
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </datalist>
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
                    list="banks"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="input input-bordered"
                    placeholder="Search bank..."
                    required
                  />
                  <datalist id="banks">
                    {saBanks.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </datalist>
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
        <div className="card bg-base-100 shadow-xl ring-2 ring-base-300">
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
                        <span className="badge badge-success badge-outline badge-md">
                          Completed
                        </span>
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
                        <span className="badge badge-error badge-outline badge-md">
                          Failed
                        </span>
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
