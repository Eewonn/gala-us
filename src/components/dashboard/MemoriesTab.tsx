"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Memory, User } from "@/types/database";

type MemoryWithUser = Memory & { user?: User };

interface Props {
  galaId: string;
  userId: string;
  memories: MemoryWithUser[];
  onRefresh: () => void;
}

export default function MemoriesTab({ galaId, userId, memories, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ drive_link: "", caption: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.drive_link.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from("memories").insert({
      gala_id: galaId,
      user_id: userId,
      drive_link: form.drive_link.trim(),
      caption: form.caption.trim() || null,
    });
    setForm({ drive_link: "", caption: "" });
    setShowForm(false);
    setSubmitting(false);
    onRefresh();
  };

  const ACCENT_COLORS = [
    "shadow-[8px_8px_0px_0px_rgba(255,88,51,1)]",
    "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
    "shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-5xl font-black leading-none">
            YOUR <span className="text-[#ff5833] italic underline underline-offset-4">MEMORIES</span>
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Captured magic from your greatest celebrations.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#ff5833] text-white font-black px-6 py-3 rounded-xl border-3 border-slate-900 shadow-playful-sm btn-push flex items-center gap-2 uppercase tracking-wider"
        >
          <span className="material-symbols-outlined">cloud_upload</span>
          Add Memory
        </button>
      </div>

      {/* Add memory modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl bold-border shadow-playful w-full max-w-md p-6">
            <h3 className="text-2xl font-black mb-4">Add a Memory</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-xs uppercase tracking-wider text-slate-500">
                  Google Drive Link *
                </label>
                <input
                  name="drive_link"
                  value={form.drive_link}
                  onChange={handleChange}
                  required
                  placeholder="https://drive.google.com/..."
                  className="w-full h-12 px-4 border-3 border-slate-900 rounded-lg font-semibold focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
                />
                <p className="text-xs text-slate-400 font-medium">
                  Paste a shareable Google Drive photo link.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-black text-xs uppercase tracking-wider text-slate-500">
                  Caption (optional)
                </label>
                <textarea
                  name="caption"
                  value={form.caption}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Describe this moment..."
                  className="w-full px-4 py-3 border-3 border-slate-900 rounded-lg font-semibold focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 bg-[#ff5833] text-white font-black rounded-lg border-2 border-slate-900 btn-push disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Memory"}
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

      {/* Gallery */}
      {memories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl bold-border">
          <span className="material-symbols-outlined text-6xl text-slate-300 block mb-4">photo_library</span>
          <p className="text-xl font-black text-slate-400">No memories yet</p>
          <p className="text-slate-400 font-medium mt-1">
            Add a Google Drive link to capture your first memory!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {memories.map((mem, i) => (
            <div
              key={mem.id}
              className={`group bg-white border-4 border-slate-900 rounded-xl overflow-hidden ${ACCENT_COLORS[i % ACCENT_COLORS.length]}`}
            >
              <a
                href={mem.drive_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#ff5833]/10 to-slate-100 border-b-4 border-slate-900 flex items-center justify-center relative overflow-hidden group-hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-slate-300 text-7xl">
                    photo_library
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="bg-white rounded-full p-3 bold-border">
                      <span className="material-symbols-outlined text-slate-900 text-2xl">open_in_new</span>
                    </div>
                  </div>
                </div>
              </a>
              <div className="p-4 flex justify-between items-start">
                <div>
                  {mem.caption && (
                    <p className="font-black text-slate-900 uppercase leading-tight mb-1">
                      {mem.caption}
                    </p>
                  )}
                  <p className="text-sm font-bold text-[#ff5833]">
                    {mem.user?.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    {new Date(mem.created_at).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={mem.drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#ff5833] p-1 transition-colors"
                >
                  <span className="material-symbols-outlined">open_in_new</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
