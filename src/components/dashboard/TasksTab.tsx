"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TaskWithAssignee, GalaMember, User } from "@/types/database";

interface Props {
  galaId: string;
  userId: string;
  tasks: TaskWithAssignee[];
  members: (GalaMember & { user: User })[];
  onRefresh: () => void;
}

const STATUS_META = {
  todo: { label: "TO DO", color: "bg-slate-100 text-slate-600 border-slate-300", dot: "bg-slate-400" },
  doing: { label: "IN PROGRESS", color: "bg-yellow-100 text-yellow-700 border-yellow-400", dot: "bg-yellow-400" },
  done: { label: "DONE", color: "bg-green-100 text-green-700 border-green-400", dot: "bg-green-500" },
} as const;

type Status = keyof typeof STATUS_META;

export default function TasksTab({ galaId, userId, tasks, members, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const grouped = {
    todo: tasks.filter((t) => t.status === "todo"),
    doing: tasks.filter((t) => t.status === "doing"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from("tasks").insert({
      gala_id: galaId,
      title: newTitle.trim(),
      assigned_to: assignTo || null,
      status: "todo",
    });
    setNewTitle("");
    setAssignTo("");
    setShowForm(false);
    setSubmitting(false);
    onRefresh();
  };

  const updateStatus = async (id: string, status: Status) => {
    const supabase = createClient();
    await supabase.from("tasks").update({ status }).eq("id", id);
    onRefresh();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black leading-none">Task Board</h2>
          <p className="text-slate-500 font-medium mt-1">
            Manage and track your team&apos;s progress.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#ff5833] text-white font-black px-6 py-3 rounded-xl border-3 border-slate-900 shadow-playful-sm btn-push flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span>
          NEW TASK
        </button>
      </div>

      {/* Add Task modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl bold-border shadow-playful w-full max-w-md p-6">
            <h3 className="text-2xl font-black mb-4">New Task</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-xs uppercase tracking-wider text-slate-500">
                  Task Title *
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="e.g. Book the venue"
                  className="w-full h-12 px-4 border-3 border-slate-900 rounded-lg font-semibold focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-xs uppercase tracking-wider text-slate-500">
                  Assign To (optional)
                </label>
                <select
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className="w-full h-12 px-4 border-3 border-slate-900 rounded-lg font-semibold focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
                >
                  <option value="">Unassigned</option>
                  {members.map(({ user }) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 bg-[#ff5833] text-white font-black rounded-lg border-2 border-slate-900 btn-push disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Create Task"}
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

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(["todo", "doing", "done"] as Status[]).map((status) => (
          <div key={status} className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className={`size-3 rounded-full ${STATUS_META[status].dot}`} />
                <h3 className="font-black text-lg">{STATUS_META[status].label}</h3>
                <span className="bg-slate-900 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {grouped[status].length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-h-[200px]">
              {grouped[status].map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-xl border-3 border-slate-900 shadow-playful-sm hover:shadow-[6px_6px_0px_0px_rgba(255,88,51,1)] transition-all group"
                >
                  <p className={`font-extrabold mb-3 group-hover:text-[#ff5833] transition-colors ${task.status === "done" ? "line-through text-slate-400" : ""}`}>
                    {task.title}
                  </p>
                  {task.assignee_name && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="size-6 rounded-full bg-[#ff5833] flex items-center justify-center">
                        <span className="text-white text-xs font-black">
                          {task.assignee_name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{task.assignee_name}</span>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {(["todo", "doing", "done"] as Status[])
                      .filter((s) => s !== status)
                      .map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(task.id, s)}
                          className={`text-[10px] font-black px-2 py-1 rounded border ${STATUS_META[s].color} hover:opacity-80 transition-opacity`}
                        >
                          → {STATUS_META[s].label}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
              {grouped[status].length === 0 && (
                <div className="border-3 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-300 font-bold text-sm">
                  No tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
