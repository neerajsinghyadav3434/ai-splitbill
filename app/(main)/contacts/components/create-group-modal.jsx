"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
});

export function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);

  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const createGroup = useConvexMutation(api.contacts.createGroup);
  const { data: searchResults, isLoading: isSearching } = useConvexQuery(
    api.users.searchUsers,
    { query: searchQuery }
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const addMember = (user) => {
    if (!selectedMembers.some((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setAddMemberModalOpen(false);
    setSearchQuery("");
  };

  const removeMember = (userId) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

  const onSubmit = async (data) => {
    try {
      // Extract member IDs
      const memberIds = selectedMembers.map((member) => member.id);

      // Create the group
      const groupId = await createGroup.mutate({
        name: data.name,
        description: data.description,
        members: memberIds,
      });

      // Success
      toast.success("Group created successfully!");
      reset();
      setSelectedMembers([]);
      onClose();

      // Redirect to the new group page
      if (onSuccess) {
        onSuccess(groupId);
      }
    } catch (error) {
      toast.error("Failed to create group: " + error.message);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedMembers([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-white shadow-2xl border-0">
        <DialogHeader className="space-y-3 pb-6 border-b">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Create New Group
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Organize shared expenses with friends and family
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-900">
              Group Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Trip to Goa, Roommates, Office Lunch"
              className="h-11 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="text-xs">⚠</span> {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-900">
              Description <span className="text-xs text-gray-500 font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Add a brief description..."
              rows={3}
              className="border-gray-300 focus:border-violet-500 focus:ring-violet-500 resize-none"
              {...register("description")}
            />
          </div>

          {/* Members Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-900">
                Members
              </Label>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                {selectedMembers.length + 1} {selectedMembers.length === 0 ? 'member' : 'members'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
              {/* Member Chips */}
              <div className="flex flex-wrap gap-2">
                {/* Current user (always included) */}
                {currentUser && (
                  <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-900 px-3 py-2 rounded-lg border border-violet-200">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={currentUser.imageUrl} />
                      <AvatarFallback className="bg-violet-200 text-violet-900 text-xs font-semibold">
                        {currentUser.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{currentUser.name}</span>
                    <span className="text-xs bg-violet-200 px-1.5 py-0.5 rounded">You</span>
                  </div>
                )}

                {/* Selected members */}
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="inline-flex items-center gap-2 bg-white border border-gray-300 px-3 py-2 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.imageUrl} />
                      <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                        {member.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="ml-1 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50 p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add member button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddMemberModalOpen(true)}
                  className="h-auto px-3 py-2 border-dashed border-gray-300 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-all"
                >
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Add member
                </Button>
              </div>

              {/* Validation Message */}
              {selectedMembers.length === 0 && (
                <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <span className="text-base">💡</span>
                  <span>Add at least one other person to create the group</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <DialogFooter className="gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={isSubmitting || selectedMembers.length === 0}
              className="flex-1 sm:flex-none min-w-[140px] shadow-lg shadow-violet-500/30"
            >
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Add Member Nested Modal */}
      <Dialog open={addMemberModalOpen} onOpenChange={setAddMemberModalOpen}>
        <DialogContent className="sm:max-w-md bg-white shadow-2xl border-0">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add Member
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Search and add people to your group
            </p>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="member-search" className="text-sm font-medium text-gray-900">
                Search
              </Label>
              <div className="relative">
                <Input
                  id="member-search"
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
                ) : isSearching ? (
                  <div className="py-12 px-4 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Searching...</p>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {searchResults
                      .filter((user) => !selectedMembers.some((m) => m.id === user.id))
                      .map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => addMember(user)}
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
                setAddMemberModalOpen(false);
                setSearchQuery("");
              }}
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
