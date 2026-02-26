"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function GreetingModal({ isOpen, onClose, notification }) {
    const [message, setMessage] = useState("");
    const sendGreeting = useMutation(api.notifications.sendGreeting);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (notification) {
            if (notification.type === "birthday") {
                setMessage("Happy Birthday! Have a great one! 🎉");
            } else if (notification.type === "group_created") {
                setMessage("Glad to be part of this group! Let's get things rolling. 🚀");
            } else {
                setMessage("Hello!");
            }
        }
    }, [notification]);

    const handleSend = async () => {
        if (!notification) return;
        setIsSending(true);
        try {
            await sendGreeting({
                notificationId: notification._id,
                message: message,
            });
            toast.success("Greeting sent!");
            onClose();
        } catch (error) {
            toast.error("Failed to send greeting");
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Send Greeting</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={isSending || !message.trim()} className="gradient text-white">
                        {isSending ? "Sending..." : "Send Greeting"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
