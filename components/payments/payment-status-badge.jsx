"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Banknote, CreditCard, QrCode } from "lucide-react";

const statusConfig = {
    completed: {
        icon: CheckCircle,
        variant: "default",
        className: "bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200",
        label: "Completed",
    },
    pending: {
        icon: Clock,
        variant: "secondary",
        className: "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-200",
        label: "Pending",
    },
    failed: {
        icon: XCircle,
        variant: "destructive",
        className: "bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-200",
        label: "Failed",
    },
};

const methodConfig = {
    razorpay: {
        icon: CreditCard,
        label: "Razorpay",
    },
    upi: {
        icon: QrCode,
        label: "UPI",
    },
    cash: {
        icon: Banknote,
        label: "Cash",
    },
};

export default function PaymentStatusBadge({ status, method, className }) {
    const statusInfo = statusConfig[status] || statusConfig.completed;
    const methodInfo = method ? methodConfig[method] : null;

    const StatusIcon = statusInfo.icon;
    const MethodIcon = methodInfo?.icon;

    return (
        <div className={`flex items-center gap-2 ${className || ""}`}>
            {/* Payment Method Badge */}
            {methodInfo && (
                <Badge variant="outline" className="text-xs border-violet-200 hover:bg-violet-50 transition-colors">
                    <MethodIcon className="h-3 w-3 mr-1" />
                    {methodInfo.label}
                </Badge>
            )}

            {/* Status Badge */}
            <Badge variant={statusInfo.variant} className={`text-xs ${statusInfo.className} transition-all duration-200`}>
                <StatusIcon className="h-3 w-3 mr-1 animate-in fade-in-0" />
                {statusInfo.label}
            </Badge>
        </div>
    );
}
