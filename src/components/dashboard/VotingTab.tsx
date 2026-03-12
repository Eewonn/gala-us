"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SuggestionWithVotes } from "@/types/database";
import LocationPreview from "@/components/LocationPreview";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Props {
  galaId: string;
  userId: string;
  suggestions: SuggestionWithVotes[];
  onRefresh: () => void;
}

const TYPES = ["location", "food", "activity"] as const;
type SuggType = (typeof TYPES)[number];

const TYPE_META: Record<SuggType, { icon: string; label: string; color: string }> = {
  location: { icon: "location_on", label: "Location", color: "text-blue-600 bg-blue-100 border-blue-400" },
  food: { icon: "restaurant", label: "Food & Drinks", color: "text-orange-600 bg-orange-100 border-orange-400" },
  activity: { icon: "local_activity", label: "Activities", color: "text-purple-600 bg-purple-100 border-purple-400" },
};

export default function VotingTab({ galaId, userId, suggestions, onRefresh }: Props) {
  const [activeType, setActiveType] = useState<SuggType>("location");
  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newLink, setNewLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<SuggestionWithVotes | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = suggestions.filter((s) => s.type === activeType);
  const sorted = [...filtered].sort((a, b) => b.vote_count - a.vote_count);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-menu]')) {
          setMenuOpen(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleVote = async (suggId: string, hasVoted: boolean) => {
    const supabase = createClient();
    if (hasVoted) {
      await supabase.from("votes").delete().eq("suggestion_id", suggId).eq("user_id", userId);
    } else {
      await supabase.from("votes").insert({ suggestion_id: suggId, user_id: userId });
    }
    onRefresh();
  };

  const handleAddSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    
    setSubmitting(true);
    const supabase = createClient();
    
    if (editingSuggestion) {
      // Update existing suggestion
      await supabase
        .from("suggestions")
        .update({
          content: newContent.trim(),
          link: newLink.trim() || null,
        })
        .eq("id", editingSuggestion.id);
    } else {
      // Create new suggestion
      await supabase.from("suggestions").insert({
        gala_id: galaId,
        user_id: userId,
        type: activeType,
        content: newContent.trim(),
        link: newLink.trim() || null,
      });
    }
    
    setNewContent("");
    setNewLink("");
    setShowForm(false);
    setEditingSuggestion(null);
    setSubmitting(false);
    onRefresh();
  };

  const handleEditClick = (suggestion: SuggestionWithVotes) => {
    setEditingSuggestion(suggestion);
    setActiveType(suggestion.type);
    setNewContent(suggestion.content);
    setNewLink(suggestion.link || "");
    setShowForm(true);
    setMenuOpen(null);
  };

  const handleDeleteClick = (suggestionId: string) => {
    setConfirmDelete(suggestionId);
    setMenuOpen(null);
  };

  const confirmDeleteSuggestion = async () => {
    if (!confirmDelete) return;
    
    const supabase = createClient();
    await supabase.from("suggestions").delete().eq("id", confirmDelete);
    setConfirmDelete(null);
    onRefresh();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSuggestion(null);
    setNewContent("");
    setNewLink("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black leading-none">
            Shape the <span className="text-[#ff5833] italic">Gala</span>
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Cast your votes or suggest new ideas. Every voice counts!
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#ff5833] text-white font-black px-6 py-3 rounded-xl border-3 border-slate-900 shadow-playful-sm btn-push flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span>
          NEW SUGGESTION
        </button>
      </div>

      {/* Add suggestion modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl bold-border shadow-playful w-full max-w-md p-6">
            <h3 className="text-2xl font-black mb-4">
              {editingSuggestion ? "Edit Suggestion" : "Add Suggestion"}
            </h3>
            <form onSubmit={handleAddSuggestion} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveType(t)}
                    disabled={!!editingSuggestion}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 font-bold text-sm transition-all ${
                      activeType === t ? "border-[#ff5833] bg-[#ff5833]/5" : "border-slate-200 hover:border-slate-900"
                    } ${editingSuggestion ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="material-symbols-outlined text-base">{TYPE_META[t].icon}</span>
                    {TYPE_META[t].label}
                  </button>
                ))}
              </div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                rows={3}
                placeholder={`Suggest a ${activeType}...`}
                className="w-full px-4 py-3 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5] resize-none"
              />
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder={activeType === "location" ? "Google Maps link (recommended)" : "Link (optional)"}
                className="w-full px-4 py-3 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 bg-[#ff5833] text-white font-black rounded-lg border-2 border-slate-900 btn-push disabled:opacity-50"
                >
                  {submitting ? (editingSuggestion ? "Saving..." : "Adding...") : (editingSuggestion ? "Save Changes" : "Add Suggestion")}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="h-12 px-6 bg-white font-black rounded-lg border-2 border-slate-900 btn-push"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Type tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex border-b-4 border-slate-200 min-w-max gap-1">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-6 py-3 font-black flex items-center gap-2 uppercase text-sm transition-all ${
                activeType === t
                  ? "border-b-4 border-[#ff5833] text-[#ff5833] -mb-1"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <span className="material-symbols-outlined text-base">{TYPE_META[t].icon}</span>
              {TYPE_META[t].label}
              <span className={`text-xs px-2 py-0.5 rounded-full font-black ${activeType === t ? "bg-[#ff5833] text-white" : "bg-slate-100 text-slate-500"}`}>
                {suggestions.filter((s) => s.type === t).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl bold-border">
          <span className="material-symbols-outlined text-6xl text-slate-300 block mb-4">lightbulb</span>
          <p className="text-xl font-black text-slate-400">No suggestions yet</p>
          <p className="text-slate-400 font-medium mt-1">Be the first to suggest a {activeType}!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((s) => (
            <div
              key={s.id}
              className={`bg-card rounded-xl bold-border overflow-hidden flex flex-col h-[480px] transition-all relative ${s.user_has_voted ? "shadow-playful-primary" : "shadow-playful-sm"}`}
            >
              {/* Votes badge and menu */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <div className="bg-card px-3 py-1 border-2 border-slate-900 dark:border-white/20 rounded-full font-bold text-sm">
                  {s.vote_count} VOTES
                </div>
                {s.user_id === userId && (
                  <div className="relative" data-menu>
                    <button
                      onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)}
                      className="size-8 bg-card border-2 border-slate-900 dark:border-white/20 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">more_vert</span>
                    </button>
                    {menuOpen === s.id && (
                      <div className="absolute right-0 top-full mt-2 bg-card border-3 border-slate-900 dark:border-white/20 rounded-xl shadow-playful-sm overflow-hidden min-w-[140px]">
                        <button
                          onClick={() => handleEditClick(s)}
                          className="w-full px-4 py-2.5 text-left font-bold text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                          Edit
                        </button>
                        <div className="h-px bg-slate-200"></div>
                        <button
                          onClick={() => handleDeleteClick(s.id)}
                          className="w-full px-4 py-2.5 text-left font-bold text-sm hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Header/Preview Area */}
              {s.type === "location" && s.link ? (
                <LocationPreview url={s.link} />
              ) : (
                <div className="h-40 bg-[#ff5833] flex items-center justify-center border-b-3 border-slate-900">
                  <span className="material-symbols-outlined text-6xl text-white/30">
                    {TYPE_META[s.type]?.icon || "lightbulb"}
                  </span>
                </div>
              )}
              
              <div className="p-5 flex flex-col flex-1 min-h-0">
                <p className={`text-xs font-black px-2 py-0.5 rounded-full border w-fit mb-2 ${TYPE_META[s.type]?.color}`}>
                  {s.type.toUpperCase()}
                </p>
                <p className="font-bold text-slate-800 leading-snug line-clamp-3 mb-3">{s.content}</p>
                <div className="flex-1 min-h-0">
                  {s.link && s.type !== "location" && (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-50 text-blue-700 border-2 border-blue-400 font-bold text-sm px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-100 transition-colors w-fit"
                    >
                      <span className="material-symbols-outlined text-base">link</span>
                      View Link
                    </a>
                  )}
                </div>
                {s.author_name && (
                  <p className="text-xs text-slate-400 font-medium mb-3">by {s.author_name}</p>
                )}
                <div>
                  <button
                    onClick={() => handleVote(s.id, s.user_has_voted)}
                    className={`w-full py-2.5 rounded-lg border-2 border-slate-900 dark:border-white/20 font-black flex items-center justify-center gap-2 transition-all btn-push ${
                      s.user_has_voted
                        ? "bg-[#ff5833] text-white"
                        : "bg-card text-foreground hover:bg-[#ff5833]/10"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {s.user_has_voted ? "thumb_up" : "thumb_up"}
                    </span>
                    {s.user_has_voted ? "VOTED" : "UPVOTE"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Suggestion"
        message="Are you sure you want to delete this suggestion? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDeleteSuggestion}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
