"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ExpenseWithPayer, GalaMember, User } from "@/types/database";

interface Props {
  galaId: string;
  userId: string;
  expenses: ExpenseWithPayer[];
  members: (GalaMember & { user: User })[];
  onRefresh: () => void;
}

export default function BudgetTab({ galaId, userId, expenses, members, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const memberCount = members.length || 1;
  const perPerson = totalSpent / memberCount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("expenses").insert({
      gala_id: galaId,
      paid_by: userId,
      amount: parseFloat(form.amount),
      description: form.description,
    });
    
    if (error) {
      console.error("Failed to create expense:", error);
      alert("Failed to create expense. Please try again.");
      setSubmitting(false);
      return;
    }
    
    setForm({ description: "", amount: "" });
    setShowForm(false);
    setSubmitting(false);
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
          <div className="bg-white rounded-xl bold-border shadow-playful w-full max-w-md p-6">
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
                  Amount (USD) *
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
                  onClick={() => setShowForm(false)}
                  className="h-12 px-6 bg-white font-black rounded-lg border-2 border-slate-900 btn-push"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
            <span className="material-symbols-outlined text-blue-600">person</span>
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Cost Per Person</p>
          <p className="text-4xl font-black">${perPerson.toFixed(2)}</p>
          <p className="text-xs text-slate-400 font-medium mt-1">{memberCount} members</p>
        </div>
        <div className="bg-[#ff5833] rounded-xl bold-border p-6 shadow-playful-sm text-white">
          <p className="text-sm font-black uppercase tracking-widest mb-3">Total Expenses</p>
          <p className="text-4xl font-black">{expenses.length}</p>
          <p className="text-sm font-bold mt-1 text-white/70">transactions logged</p>
        </div>
      </div>

      {/* Expense table */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400">Description</th>
                  <th className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400">Paid By</th>
                  <th className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, i) => (
                  <tr key={expense.id} className={`border-b border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50"}`}>
                    <td className="px-6 py-4 font-bold">{expense.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-[#ff5833] flex items-center justify-center">
                          <span className="text-white text-xs font-black">
                            {(expense.payer_name || "?").charAt(0)}
                          </span>
                        </div>
                        <span className="font-bold text-sm">{expense.payer_name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-[#ff5833]">
                        ${Number(expense.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm font-medium">
                      {new Date(expense.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-3 border-slate-900 bg-[#ff5833]/5">
                  <td className="px-6 py-4 font-black uppercase text-sm" colSpan={2}>
                    Total
                  </td>
                  <td className="px-6 py-4 font-black text-[#ff5833] text-xl" colSpan={2}>
                    ${totalSpent.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
