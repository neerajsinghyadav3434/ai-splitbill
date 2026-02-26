"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { BarLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, User, Mail, UserCircle } from "lucide-react";
import { CreateGroupModal } from "./components/create-group-modal";

export default function ContactsPage() {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading } = useConvexQuery(api.contacts.getAllContacts);

  // Check for the createGroup parameter when the component mounts
  useEffect(() => {
    const createGroupParam = searchParams.get("createGroup");

    if (createGroupParam === "true") {
      // Open the modal
      setIsCreateGroupModalOpen(true);

      // Remove the parameter from the URL
      const url = new URL(window.location.href);
      url.searchParams.delete("createGroup");

      // Replace the current URL without the parameter
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  const { users, groups } = data || { users: [], groups: [] };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-8">
        <h1 className="text-5xl gradient-title">Contacts</h1>
        <Button
          onClick={() => setIsCreateGroupModalOpen(true)}
          variant="gradient"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* People Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-violet-100 p-2 rounded-lg">
            <User className="h-5 w-5 text-violet-600" />
          </div>
          <h2 className="text-xl font-semibold">People</h2>
          {users.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({users.length})
            </span>
          )}
        </div>

        {users.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <UserCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">
              No contacts yet. Add an expense with someone to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((user) => (
              <Link key={user.id} href={`/person/${user.id}`}>
                <div className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-violet-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-violet-100 group-hover:border-violet-300 transition-colors">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback className="bg-violet-100 text-violet-700 text-lg font-semibold">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full" />
                    </div>

                    {/* Name */}
                    <div className="w-full">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition- opacity">
                      <div className="h-2 w-2 bg-violet-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Groups Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold">Groups</h2>
          {groups.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({groups.length})
            </span>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">
              No groups yet. Create a group to start tracking shared expenses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <div className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Group Icon */}
                    <div className="relative">
                      <div className="h-16 w-16 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center border-2 border-blue-100 group-hover:border-blue-300 transition-all">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>

                    {/* Group Name */}
                    <div className="w-full">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {group.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                      </p>
                    </div>

                    {/* Hover indicator */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onSuccess={(groupId) => {
          router.push(`/groups/${groupId}`);
        }}
      />
    </div>
  );
}
