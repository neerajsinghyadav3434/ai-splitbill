"use client";

import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

/**
 * Expected `balances` shape (one object per member):
 * {
 *   id:           string;           // user id
 *   name:         string;
 *   imageUrl?:    string;
 *   totalBalance: number;           // + ve ⇒ they are owed, – ve ⇒ they owe
 *   owes:   { to: string;   amount: number }[];  // this member → others
 *   owedBy: { from: string; amount: number }[];  // others → this member
 * }
 */
export function GroupBalances({ balances }) {
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);

  /* ───── guards ────────────────────────────────────────────────────────── */
  if (!balances?.length || !currentUser) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No balance information available
      </div>
    );
  }

  /* ───── helpers ───────────────────────────────────────────────────────── */
  const me = balances.find((b) => b.id === currentUser._id);
  if (!me) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        You’re not part of this group
      </div>
    );
  }

  const userMap = Object.fromEntries(balances.map((b) => [b.id, b]));

  // Who owes me?
  const owedByMembers = me.owedBy
    .map(({ from, amount }) => ({ ...userMap[from], amount }))
    .sort((a, b) => b.amount - a.amount);

  // Whom do I owe?
  const owingToMembers = me.owes
    .map(({ to, amount }) => ({ ...userMap[to], amount }))
    .sort((a, b) => b.amount - a.amount);

  const isAllSettledUp =
    me.totalBalance === 0 &&
    owedByMembers.length === 0 &&
    owingToMembers.length === 0;

  /* ───── UI ────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* Current user's total balance */}
      <div className="bg-gradient-to-br from-violet-50 via-blue-50 to-violet-50 rounded-xl p-6">
        <p className="text-sm font-medium text-gray-600 mb-2">Your Balance</p>
        <p
          className={`text-3xl font-bold ${me.totalBalance > 0
              ? "text-green-600"
              : me.totalBalance < 0
                ? "text-red-600"
                : "text-gray-900"
            }`}
        >
          {me.totalBalance > 0
            ? `+₹${me.totalBalance.toFixed(2)}`
            : me.totalBalance < 0
              ? `-₹${Math.abs(me.totalBalance).toFixed(2)}`
              : "₹0.00"}
        </p>
        <p className="text-sm text-gray-600 mt-2 font-medium">
          {me.totalBalance > 0
            ? "You are owed money"
            : me.totalBalance < 0
              ? "You owe money"
              : "You are all settled up"}
        </p>
      </div>

      {isAllSettledUp ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-3">
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-gray-600 font-medium">Everyone is settled up!</p>
          <p className="text-sm text-gray-500 mt-1">No outstanding balances</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* People who owe the current user */}
          {owedByMembers.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h3 className="text-sm font-semibold text-green-900 flex items-center mb-3">
                <ArrowUpCircle className="h-4 w-4 text-green-600 mr-2" />
                Owed to You
              </h3>
              <div className="space-y-2">
                {owedByMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                        <AvatarImage src={member.imageUrl} />
                        <AvatarFallback className="bg-green-100 text-green-700 text-sm font-semibold">
                          {member.name?.charAt(0) ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">{member.name}</span>
                    </div>
                    <span className="font-bold text-green-700">
                      ₹{member.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People the current user owes */}
          {owingToMembers.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <h3 className="text-sm font-semibold text-red-900 flex items-center mb-3">
                <ArrowDownCircle className="h-4 w-4 text-red-600 mr-2" />
                You Owe
              </h3>
              <div className="space-y-2">
                {owingToMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                        <AvatarImage src={member.imageUrl} />
                        <AvatarFallback className="bg-red-100 text-red-700 text-sm font-semibold">
                          {member.name?.charAt(0) ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">{member.name}</span>
                    </div>
                    <span className="font-bold text-red-700">
                      ₹{member.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
