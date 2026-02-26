"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UpiQrInline({
    amount,
    payeeName,
    payeeUpiId,
    note,
}) {
    const canvasRef = useRef(null);
    const [qrGenerated, setQrGenerated] = useState(false);
    const [showDevMessage, setShowDevMessage] = useState(false);

    useEffect(() => {
        if (canvasRef.current && payeeUpiId) {
            generateQR();
        }
    }, [payeeUpiId, amount, payeeName, note]);

    // Show development mode message after 30 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowDevMessage(true);
        }, 30000); // 30 seconds

        return () => clearTimeout(timer);
    }, []);

    const generateQR = async () => {
        try {
            // Construct UPI payment string
            const upiString = `upi://pay?pa=${encodeURIComponent(
                payeeUpiId
            )}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR${note ? `&tn=${encodeURIComponent(note)}` : ""
                }`;

            // Generate QR code on canvas
            await QRCode.toCanvas(canvasRef.current, upiString, {
                width: 240,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
            });

            setQrGenerated(true);
        } catch (error) {
            console.error("QR generation error:", error);
            toast.error("Failed to generate QR code");
        }
    };

    const downloadQR = () => {
        if (!canvasRef.current) return;

        try {
            const url = canvasRef.current.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `splitr-payment-qr-${Date.now()}.png`;
            link.href = url;
            link.click();
            toast.success("QR code downloaded");
        } catch (error) {
            toast.error("Failed to download QR code");
        }
    };

    return (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-br from-background via-muted/30 to-background border-2 border-primary/20 rounded-xl">
                <div className="bg-white p-5 rounded-lg shadow-lg border border-muted">
                    <canvas ref={canvasRef} />
                </div>

                <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        Scan with any UPI app to pay
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                        ₹{amount.toFixed(2)}
                    </p>
                </div>

                <Button
                    onClick={downloadQR}
                    variant="outline"
                    size="sm"
                    disabled={!qrGenerated}
                    className="gap-2"
                >
                    <Download className="h-4 w-4" />
                    Download QR Code
                </Button>
            </div>

            {showDevMessage && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Development Mode
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            This is development mode. UPI payments are not connected to bank
                            details yet.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
