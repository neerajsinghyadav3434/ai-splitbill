"use client";

import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getCategoryById } from "@/lib/expense-categories";
import { getCategoryIcon } from "@/lib/expense-categories";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ExpenseList({
  expenses,
  showOtherPerson = true,
  isGroupExpense = false,
  otherPersonId = null,
  userLookupMap = {},
}) {
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const deleteExpense = useConvexMutation(api.expenses.deleteExpense);

  if (!expenses || !expenses.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No expenses found
        </CardContent>
      </Card>
    );
  }

  // Helper to get user details from cache or look up from expense
  const getUserDetails = (userId) => {
    // For the group context, we need to look up members from somewhere else
    // This is a simplified fallback
    return {
      name:
        userId === currentUser?._id
          ? "You"
          : userLookupMap[userId]?.name || "Other User",
      imageUrl: null,
      id: userId,
    };
  };

  // Check if the user can delete an expense (creator or payer)
  const canDeleteExpense = (expense) => {
    if (!currentUser) return false;
    return (
      expense.createdBy === currentUser._id ||
      expense.paidByUserId === currentUser._id
    );
  };

  // Handle delete expense
  const handleDeleteExpense = async (expense) => {
    // Use basic JavaScript confirm
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteExpense.mutate({ expenseId: expense._id });
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete expense: " + error.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {expenses.map((expense) => {
        const payer = getUserDetails(expense.paidByUserId, expense);
        const isCurrentUserPayer = expense.paidByUserId === currentUser?._id;
        const category = getCategoryById(expense.category);
        const CategoryIcon = getCategoryIcon(category.id);
        const showDeleteOption = canDeleteExpense(expense);

        return (
          <Card
            className="group transition-all duration-200 hover:shadow-md hover:border-violet-200 border-gray-200"
            key={expense._id}
          >
            <CardContent className="py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Category icon */}
                  <div className="bg-violet-100 p-2.5 rounded-lg shrink-0">
                    <CategoryIcon className="h-4 w-4 text-violet-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{expense.description}</h3>
                    <div className="flex items-center text-sm text-gray-600 gap-2 mt-0.5">
                      <span>
                        {format(new Date(expense.date), "MMM d, yyyy")}
                      </span>
                      {showOtherPerson && (
                        <>
                          <span>•</span>
                          <span className="text-gray-700 font-medium">
                            {isCurrentUserPayer ? "You" : payer.name} paid
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      ₹{expense.amount.toFixed(2)}
                    </div>
                    {isGroupExpense ? (
                      <Badge variant="outline" className="mt-1 border-violet-300 text-violet-700 bg-violet-50">
                        Group
                      </Badge>
                    ) : (
                      <div className="text-xs mt-0.5">
                        {isCurrentUserPayer ? (
                          <span className="text-green-600 font-semibold">You paid</span>
                        ) : (
                          <span className="text-red-600 font-semibold">
                            {payer.name} paid
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {showDeleteOption && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExpense(expense);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete expense</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Display splits info */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex gap-1.5 flex-wrap">
                  {expense.splits.map((split, idx) => {
                    const splitUser = getUserDetails(split.userId, expense);
                    const isCurrentUser = split.userId === currentUser?._id;
                    const shouldShow =
                      showOtherPerson ||
                      (!showOtherPerson &&
                        (split.userId === currentUser?._id ||
                          split.userId === otherPersonId));

                    if (!shouldShow) return null;

                    return (
                      <div
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${split.paid
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={splitUser.imageUrl} />
                          <AvatarFallback className="text-[10px]">
                            {splitUser.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {isCurrentUser ? "You" : splitUser.name}: ₹{split.amount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
