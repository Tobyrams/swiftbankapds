export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
export const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY;
export const PAYSTACK_API_URL = "https://api.paystack.co";

export const initializePayment = async (email, amount) => {
  try {
    const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo (smallest currency unit)
        callback_url: `${window.location.origin}/payment/verify`,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error initializing payment:", error);
    throw error;
  }
};

export const verifyPayment = async (reference) => {
  try {
    // console.log("Verifying payment with reference:", reference);
    

    const response = await fetch(
      `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Paystack API error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Paystack API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Paystack verification response:", data);

    if (!data.status) {
      console.error("Paystack verification failed:", data);
      throw new Error(data.message || "Payment verification failed");
    }

    return data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};
