"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ExpenseWithDetails, GalaMember, User } from "@/types/database";

interface Props {
  galaId: string;
  userId: string;
  expenses: ExpenseWithDetails[];
  members: (GalaMember & { user: User })[];
  proposedBudget: number | null;
  onRefresh: () => void;
}

export default function BudgetTab({ galaId, userId, expenses, members, proposedBudget, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "" });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(proposedBudget?.toString() || "");

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const actualPerPerson = members.length > 0 ? totalSpent / members.length : 0;
  
  // Calculate per-user totals
  const userTotals = members.map(member => {
    const userExpenses = expenses.flatMap(e => 
      e.assignments
        .filter(a => a.user_id === member.user_id)
        .map(a => ({ amount: Number(a.amount), status: a.status }))
    );
    const total = userExpenses.reduce((sum, e) => sum + e.amount, 0);
    const paid = userExpenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
    const pending = userExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
    return {
      user: member.user,
      total,
      paid,
      pending,
    };
  }).filter(u => u.total > 0); // Only show users with expenses

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const toggleUser = (memberId: string) => {
    setSelectedUsers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || selectedUsers.length === 0) {
      alert("Please fill all fields and select at least one person to assign the expense.");
      return;
    }
    
    setSubmitting(true);
    const supabase = createClient();
    
    // Create the expense
    const { data: newExpense, error: expenseError } = await supabase
      .from("expenses")
      .insert({
        gala_id: galaId,
        paid_by: userId, // Legacy field, keeping for compatibility
        amount: parseFloat(form.amount),
        description: form.description,
        created_by: userId,
      })
      .select()
      .single();
    
    if (expenseError || !newExpense) {
      console.error("Failed to create expense:", expenseError);
      alert("Failed to create expense. Please try again.");
      setSubmitting(false);
      return;
    }
    
    // Create expense assignments (split evenly among selected users)
    const amountPerUser = parseFloat(form.amount) / selectedUsers.length;
    const assignments = selectedUsers.map(uid => ({
      expense_id: newExpense.id,
      user_id: uid,
      amount: amountPerUser,
      status: 'pending' as const,
    }));
    
    const { error: assignmentError } = await supabase
      .from("expense_assignments")
      .insert(assignments);
    
    if (assignmentError) {
      console.error("Failed to create expense assignments:", assignmentError);
      alert("Failed to assign expense. Please try again.");
      setSubmitting(false);
      return;
    }
    
    setForm({ description: "", amount: "" });
    setSelectedUsers([]);
    setShowForm(false);
    setSubmitting(false);
    onRefresh();
  };

  const markAsPaid = async (assignmentId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("expense_assignments")
      .update({ 
        status: 'paid' as const,
        paid_at: new Date().toISOString(),
      })
      .eq("id", assignmentId);
    
    if (error) {
      console.error("Failed to mark as paid:", error);
      alert("Failed to update payment status. Please try again.");
      return;
    }
    
    onRefresh();
  };

  const handleUpdateBudget = async () => {
    const newBudget = parseFloat(budgetInput);
    if (isNaN(newBudget) || newBudget < 0) {
      alert("Please enter a valid budget amount.");
      return;
    }
    
    const supabase = createClient();
    const { error } = await supabase
      .from("galas")
      .update({ proposed_budget_per_person: newBudget })
      .eq("id", galaId);
    
    if (error) {
      console.error("Failed to update budget:", error);
      alert("Failed to update budget. Please try again.");
      return;
    }
    
    setEditingBudget(false);
    onRefresh();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black leading-none italic">Event Budget</h2>
          <p className="text-slate-500 font-medium mt-1">Tracking every penny.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#ff5833] text-white font-black px-6 py-3 rounded-xl border-3 border-slate-900 shadow-playful-sm btn-push flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span>
          NEW EXPENSE
        </button>
      </div>

      {/* Add expense modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl bold-border shadow-playful w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black mb-4">Add Expense</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-xs uppercase tracking-wider text-slate-500">
                  Description *
                </label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Venue deposit"
                  className="w-full h-12 px-4 border-3 border-slate-900 rounded-lg font-semibold focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-xs uppercase tracking-wider text-slate-500">
                  Total Amount (USD) *
                </label>
                <input
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full h-12 px-4 border-3 border-slate-900 rounded-lg font-semibold focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-black text-xs uppercase tracking-wider text-slate-500">
                  Assign To * (Select who will pay)
                </label>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border-2 border-slate-200 rounded-lg p-3 bg-[#f8f6f5]">
                  {members.map(({ user }) => (
                    <label key={user.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="size-5 rounded border-2 border-slate-900 text-[#ff5833] focus:ring-[#ff5833]"
                      />
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-[#ff5833] border-2 border-slate-900 flex items-center justify-center">
                          <span className="text-white text-xs font-black">{user.name.charAt(0)}</span>
                        </div>
                        <span className="font-bold text-sm">{user.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedUsers.length > 0 && form.amount && (
                  <p className="text-xs text-slate-500 font-medium">
                    Split: ${(parseFloat(form.amount) / selectedUsers.length).toFixed(2)} per person
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 bg-[#ff5833] text-white font-black rounded-lg border-2 border-slate-900 btn-push disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Expense"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedUsers([]);
                  }}
                  className="h-12 px-6 bg-white font-black rounded-lg border-2 border-slate-900 btn-push"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proposed Budget Card */}
      {editingBudget ? (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl bold-border p-6 shadow-playful text-white">
          <p className="text-sm font-black uppercase tracking-widest mb-3">Proposed Budget Per Person</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-black">$</span>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="flex-1 h-12 px-4 border-3 border-slate-900 rounded-lg font-black text-3xl bg-white text-slate-900 focus:outline-none focus:border-blue-700"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpdateBudget}
              className="flex-1 bg-white text-blue-600 font-black px-4 py-2 rounded-lg border-2 border-slate-900 btn-push text-sm"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingBudget(false);
                setBudgetInput(proposedBudget?.toString() || "");
              }}
              className="flex-1 bg-blue-700 text-white font-black px-4 py-2 rounded-lg border-2 border-slate-900 btn-push text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl bold-border p-6 shadow-playful text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined">target</span>
            </div>
            <button
              onClick={() => setEditingBudget(true)}
              className="bg-white/20 hover:bg-white/30 text-white font-black text-xs px-3 py-1.5 rounded-lg border-2 border-white/30 transition-colors"
            >
              {proposedBudget ? "Edit" : "Set"}
            </button>
          </div>
          <p className="text-sm font-black uppercase tracking-widest mb-1">Proposed Budget Per Person</p>
          {proposedBudget ? (
            <>
              <p className="text-4xl font-black">${proposedBudget.toFixed(2)}</p>
              <div className="mt-3 pt-3 border-t-2 border-white/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-white/80">Actual:</span>
                  <span className="font-black">${actualPerPerson.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="font-bold text-white/80">Difference:</span>
                  <span className={`font-black ${actualPerPerson > proposedBudget ? "text-red-200" : "text-green-200"}`}>
                    {actualPerPerson > proposedBudget ? "+" : ""}
                    ${(actualPerPerson - proposedBudget).toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xl font-medium text-white/70 mt-2">No budget set yet</p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm">
          <div className="size-10 rounded-full bg-[#ff5833]/10 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[#ff5833]">payments</span>
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Total Spent</p>
          <p className="text-4xl font-black">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm">
          <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-blue-600">people</span>
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">People with Expenses</p>
          <p className="text-4xl font-black">{userTotals.length}</p>
          <p className="text-xs text-slate-400 font-medium mt-1">of {members.length} members</p>
        </div>
        <div className="bg-[#ff5833] rounded-xl bold-border p-6 shadow-playful-sm text-white">
          <p className="text-sm font-black uppercase tracking-widest mb-3">Total Expenses</p>
          <p className="text-4xl font-black">{expenses.length}</p>
          <p className="text-sm font-bold mt-1 text-white/70">transactions logged</p>
        </div>
      </div>

      {/* Per-User Budget Summary */}
      {userTotals.length > 0 && (
        <div className="bg-white rounded-xl bold-border shadow-playful overflow-hidden">
          <div className="p-5 border-b-3 border-slate-900 flex justify-between items-center bg-slate-50">
            <h3 className="text-lg font-black uppercase">Budget by Person</h3>
          </div>
          <div className="p-6 space-y-4">
            {userTotals.map(({ user, total, paid, pending }) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#ff5833] border-2 border-slate-900 flex items-center justify-center">
                    <span className="text-white text-sm font-black">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {paid > 0 && `Paid: $${paid.toFixed(2)}`}
                      {paid > 0 && pending > 0 && " • "}
                      {pending > 0 && `Pending: $${pending.toFixed(2)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#ff5833]">${total.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 font-bold">
                    {pending === 0 ? "✓ All paid" : `${((paid / total) * 100).toFixed(0)}% paid`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Details */}
      <div className="bg-white rounded-xl bold-border shadow-playful overflow-hidden">
        <div className="p-5 border-b-3 border-slate-900 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-black uppercase">All Expenses</h3>
        </div>
        {expenses.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-5xl block mb-3">receipt_long</span>
            <p className="font-black text-lg">No expenses yet</p>
            <p className="font-medium mt-1">Add the first expense to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {expenses.map((expense) => (
              <div key={expense.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h4 className="font-black text-lg text-slate-900">{expense.description}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      <span className="font-medium text-slate-500">Added by:</span>
                      <span className="font-bold text-slate-700">{expense.creator_name || "Unknown"}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-medium">
                        {new Date(expense.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-[#ff5833]">${Number(expense.amount).toFixed(2)}</p>
                    <p className="text-xs text-slate-500 font-bold mt-1">Total Expense</p>
                  </div>
                </div>
                
                {/* Assignments */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                    Assigned To ({expense.assignments.length})
                  </p>
                  {expense.assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border-2 border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-[#ff5833] border-2 border-slate-900 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-black">
                            {(assignment.user_name || "?").charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-sm">{assignment.user_name || "Unknown"}</p>
                          <p className="text-xs text-slate-500 font-medium">
                            ${Number(assignment.amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {assignment.status === 'paid' ? (
                          <div className="flex items-center gap-2 bg-green-100 px-3 py-1.5 rounded-full border-2 border-green-500">
                            <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                            <span className="text-xs font-black text-green-700">PAID</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-full border-2 border-yellow-500">
                              <span className="material-symbols-outlined text-yellow-600 text-sm">schedule</span>
                              <span className="text-xs font-black text-yellow-700">PENDING</span>
                            </div>
                            {assignment.user_id === userId && (
                              <button
                                onClick={() => markAsPaid(assignment.id)}
                                className="bg-green-500 hover:bg-green-600 text-white font-black text-xs px-3 py-1.5 rounded-lg border-2 border-slate-900 btn-push transition-colors"
                              >
                                Mark Paid
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
