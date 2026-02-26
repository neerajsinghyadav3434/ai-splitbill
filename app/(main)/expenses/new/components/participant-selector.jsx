"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function ParticipantSelector({ participants, onParticipantsChange }) {
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const [addPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Search for users
  const { data: searchResults, isLoading } = useConvexQuery(
    api.users.searchUsers,
    { query: searchQuery }
  );

  // Add a participant
  const addParticipant = (user) => {
    // Check if already added
    if (participants.some((p) => p.id === user.id)) {
      return;
    }

    // Add to list
    onParticipantsChange([...participants, user]);
    setAddPersonModalOpen(false);
    setSearchQuery("");
  };

  // Remove a participant
  const removeParticipant = (userId) => {
    // Don't allow removing yourself
    if (userId === currentUser._id) {
      return;
    }

    onParticipantsChange(participants.filter((p) => p.id !== userId));
  };

  return (
    <div>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex flex-wrap gap-2">
          {participants.map((participant) => {
            const isCurrentUser = participant.id === currentUser?._id;
            return (
              <div
                key={participant.id}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${isCurrentUser
                    ? 'bg-violet-100 text-violet-900 border-violet-200'
                    : 'bg-white border-gray-300 hover:border-gray-400 transition-colors'
                  }`}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={participant.imageUrl} />
                  <AvatarFallback className={isCurrentUser ? 'bg-violet-200 text-violet-900 text-xs' : 'bg-gray-200 text-gray-700 text-xs'}>
                    {participant.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {isCurrentUser ? participant.name : participant.name || participant.email}
                </span>
                {isCurrentUser && (
                  <span className="text-xs bg-violet-200 px-1.5 py-0.5 rounded">You</span>
                )}
                {!isCurrentUser && (
                  <button
                    type="button"
                    onClick={() => removeParticipant(participant.id)}
                    className="ml-1 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {participants.length < 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddPersonModalOpen(true)}
              className="h-auto px-3 py-2 border-dashed border-gray-300 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-all"
              type="button"
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              Add person
            </Button>
          )}
        </div>
      </div>

      {/* Add Person Nested Modal */}
      <Dialog open={addPersonModalOpen} onOpenChange={setAddPersonModalOpen}>
        <DialogContent className="sm:max-w-md bg-white shadow-2xl border-0">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add Person
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Search and add someone to split this expense
            </p>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="person-search" className="text-sm font-medium text-gray-900">
                Search
              </Label>
              <div className="relative">
                <Input
                  id="person-search"
                  placeholder="Type name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Available Users
              </Label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg max-h-[300px] overflow-y-auto">
                {searchQuery.length < 2 ? (
                  <div className="py-12 px-4 text-center">
                    <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      Type at least 2 characters to search
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="py-12 px-4 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Searching...</p>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {searchResults
                      .filter((user) => !participants.some((p) => p.id === user.id))
                      .map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => addParticipant(user)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white transition-colors text-left"
                        >
                          <Avatar className="h-10 w-10 border-2 border-gray-200">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-semibold">
                              {user.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full border-2 border-violet-500 flex items-center justify-center text-violet-600">
                              <UserPlus className="h-4 w-4" />
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="py-12 px-4 text-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <X className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No users found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddPersonModalOpen(false);
                setSearchQuery("");
              }}
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
