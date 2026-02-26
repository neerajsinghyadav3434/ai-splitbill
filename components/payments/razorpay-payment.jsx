"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { RAZORPAY_KEY_ID } from "@/lib/razorpay-config";

export default function RazorpayPayment({
    amount,
    orderId,
    userName,
    userEmail,
    description,
    onSuccess,
    onFailure,
    disabled,
}) {
    const [loading, setLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => toast.error("Failed to load payment gateway");
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const handlePayment = () => {
        if (!scriptLoaded) {
            toast.error("Payment gateway is loading. Please wait...");
            return;
        }

        setLoading(true);

        const options = {
            key: RAZORPAY_KEY_ID,
            amount: Math.round(amount * 100),
            currency: "INR",
            name: "Splitr",
            description: description || `Settlement of ₹${amount}`,
            prefill: {
                name: userName,
                email: userEmail,
            },
            theme: {
                color: "#0ea5e9",
            },
            handler: function (response) {
                setLoading(false);
                onSuccess({
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id || orderId || "dev_order",
                    razorpaySignature: response.razorpay_signature || "dev_signature",
                });
            },
            modal: {
                ondismiss: function () {
                    setLoading(false);
                    onFailure?.();
                    toast.info("Payment cancelled");
                },
            },
        };

        const isTestMode = RAZORPAY_KEY_ID.includes("test");
        if (orderId && !isTestMode) {
            options.order_id = orderId;
        }

        try {
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            setLoading(false);
            toast.error("Failed to open payment gateway");
            onFailure?.();
        }
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={disabled || loading || !scriptLoaded}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
        >
            {loading ? (
                <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    <span className="font-medium">Processing payment...</span>
                </>
            ) : !scriptLoaded ? (
                <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    <span className="font-medium">Loading payment gateway...</span>
                </>
            ) : (
                <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    <span className="font-medium">Pay ₹{amount.toFixed(2)} with Razorpay</span>
                </>
            )}
        </Button>
    );
}
