"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Gift, Users, X } from "lucide-react"; // Import X icon
import { useState, useEffect } from "react";
import { GreetingModal } from "@/components/modals/greeting-modal";
import { formatDistanceToNow } from "date-fns";

export function NotificationPanel() {
    const notifications = useQuery(api.notifications.list);
    const markAsRead = useMutation(api.notifications.markAsRead);
    const checkBirthdays = useMutation(api.notifications.checkAndCreateBirthdayNotifications); // New mutation
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Check for missed birthday notifications on mount
    useEffect(() => {
        if (checkBirthdays) {
            checkBirthdays();
        }
    }, [checkBirthdays]); // Dependencies

    if (!notifications || notifications.length === 0) return null;

    // Filter out read notifications if we want to hide them, or keep them but styled differently.
    // Requirement: "Display birthday notifications in a dashboard notification panel".
    // Usually pending ones are important.
    const activeNotifications = notifications.filter(n => !n.isRead || n.status === "pending");

    if (activeNotifications.length === 0) return null;

    const handleDismiss = async (id) => {
        await markAsRead({ notificationId: id });
    };

    return (
        <>
            <div className="space-y-4 mb-6">
                {activeNotifications.map((notification) => (
                    <Card
                        key={notification._id}
                        className={`border-l-4 border-l-violet-500 relative overflow-hidden group transition-all duration-300 hover:shadow-lg ${notification.type === 'birthday' ? 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-900/10' : ''}`}
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"> {/* Dismiss button */}
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDismiss(notification._id)}>
                                <X className="h-3 w-3" />
                                <span className="sr-only">Dismiss</span>
                            </Button>
                        </div>

                        <CardContent className="p-4 flex items-start gap-4">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-full shrink-0">
                                {notification.type === "birthday" ? (
                                    <Gift className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                ) : (
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                )}
                            </div>

                            <div className="flex-1 space-y-1">
                                <p className="font-medium text-sm text-foreground">
                                    {notification.message}
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                    </p>
                                    {notification.type === "greeting_received" && (
                                        <span className="text-xs text-green-600 font-medium">✨ Received</span>
                                    )}
                                </div>
                            </div>

                            {notification.type !== "greeting_received" && (
                                <Button
                                    size="sm"
                                    className="shrink-0 gradient text-white text-xs px-3"
                                    onClick={() => setSelectedNotification(notification)}
                                >
                                    Send Greeting
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <GreetingModal
                isOpen={!!selectedNotification}
                onClose={() => setSelectedNotification(null)}
                notification={selectedNotification}
            />
        </>
    );
}
