"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

export default function SettingsPage() {
    const user = useQuery(api.users.getCurrentUser);
    const updateProfile = useMutation(api.users.updateProfile);
    const [dob, setDob] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user && user.dateOfBirth) {
            setDob(user.dateOfBirth);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateProfile({ dateOfBirth: dob });
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    };

    if (user === undefined) {
        return (
            <div className="w-full py-12 flex justify-center">
                <BarLoader width={"100%"} color="#36d7b7" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-4xl gradient-title mb-8">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={user?.name || ""} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">Managed via Clerk</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                We use this to notify your friends on your birthday!
                            </p>
                        </div>

                        <Button type="submit" className="w-full gradient text-white" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
