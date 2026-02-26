// Razorpay credentials — set via environment variables
export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export const isDevelopmentMode = () => {
    return process.env.NODE_ENV === "development" || RAZORPAY_KEY_ID.includes("test");
};

export const convertToPaisa = (amountInRupees) => {
    return Math.round(amountInRupees * 100);
};

export const convertToRupees = (amountInPaisa) => {
    return amountInPaisa / 100;
};

export const getRazorpayOptions = ({
    orderId,
    amount,
    currency = "INR",
    name,
    description,
    prefillName,
    prefillEmail,
    prefillContact,
    onSuccess,
    onFailure,
}) => {
    return {
        key: RAZORPAY_KEY_ID,
        amount: convertToPaisa(amount),
        currency,
        name: "Splitr",
        description: description || `Settlement of ₹${amount}`,
        order_id: orderId,
        prefill: {
            name: prefillName,
            email: prefillEmail,
            contact: prefillContact,
        },
        theme: {
            color: "#3399cc",
        },
        handler: onSuccess,
        modal: {
            ondismiss: onFailure,
        },
    };
};
