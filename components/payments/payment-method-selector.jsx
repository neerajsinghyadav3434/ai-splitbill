"use client";

import { useState } from "react";
import { CreditCard, QrCode, Banknote, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const paymentMethods = [
    {
        id: "razorpay",
        name: "Razorpay",
        description: "Pay instantly with cards, UPI, netbanking",
        icon: CreditCard,
        available: true,
        badge: "Instant",
    },
    {
        id: "upi",
        name: "UPI QR Code",
        description: "Scan and pay with any UPI app",
        icon: QrCode,
        available: true,
        badge: "Scan to pay",
    },
    {
        id: "cash",
        name: "Cash / Manual",
        description: "Record manual payment",
        icon: Banknote,
        available: true,
        badge: "Record only",
    },
];

export default function PaymentMethodSelector({
    value = "cash",
    onChange,
    className,
    isDevelopmentMode = true,
    children, // For rendering inline content like UPI QR or Razorpay UI
}) {
    return (
        <div className={className}>
            <Label className="text-base font-semibold mb-4 block">
                Payment method
            </Label>
            <RadioGroup
                value={value}
                onValueChange={onChange}
                className="space-y-3"
            >
                {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = value === method.id;

                    return (
                        <div key={method.id} className="space-y-3">
                            {/* Payment Method Card */}
                            <Label
                                htmlFor={method.id}
                                className={`
                  group relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 block
                  ${isSelected
                                        ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                                        : "border-muted hover:border-primary/40 hover:bg-muted/50 hover:shadow-sm"
                                    }
                  ${!method.available ? "opacity-50 cursor-not-allowed" : ""}
                `}
                            >
                                <div className="flex items-start gap-4">
                                    <RadioGroupItem
                                        value={method.id}
                                        id={method.id}
                                        disabled={!method.available}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`p-2 rounded-lg transition-colors ${isSelected
                                                            ? "bg-primary/10 text-primary"
                                                            : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary/80"
                                                        }`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <span className="font-semibold text-base">
                                                    {method.name}
                                                </span>
                                            </div>
                                            {method.badge && (
                                                <span
                                                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${isSelected
                                                            ? "bg-primary/20 text-primary"
                                                            : "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    {method.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {method.description}
                                        </p>
                                    </div>
                                </div>
                            </Label>

                            {/* Razorpay Development Mode Message - shown when selected */}
                            {isSelected &&
                                method.id === "razorpay" &&
                                isDevelopmentMode && (
                                    <div className="ml-12 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                                Test Mode Active
                                            </p>
                                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                                Razorpay is currently running in test/development mode.
                                                Use test card credentials for payments.
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/* Inline content (e.g., UPI QR code or Razorpay button) */}
                            {isSelected && children?.[method.id]}
                        </div>
                    );
                })}
            </RadioGroup>
        </div>
    );
}
