"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SuggestionWithVotes } from "@/types/database";

interface Props {
  galaId: string;
  userId: string;
  suggestions: SuggestionWithVotes[];
  onRefresh: () => void;
}

const TYPES = ["location", "food", "date", "activity"] as const;
type SuggType = (typeof TYPES)[number];

const TYPE_META: Record<SuggType, { icon: string; label: string; color: string }> = {
  location: { icon: "location_on", label: "Location", color: "text-blue-600 bg-blue-100 border-blue-400" },
  food: { icon: "restaurant", label: "Food & Drinks", color: "text-orange-600 bg-orange-100 border-orange-400" },
  date: { icon: "calendar_month", label: "Date & Time", color: "text-green-600 bg-green-100 border-green-400" },
  activity: { icon: "local_activity", label: "Activities", color: "text-purple-600 bg-purple-100 border-purple-400" },
};

export default function VotingTab({ galaId, userId, suggestions, onRefresh }: Props) {
  const [activeType, setActiveType] = useState<SuggType>("location");
  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filtered = suggestions.filter((s) => s.type === activeType);
  const sorted = [...filtered].sort((a, b) => b.vote_count - a.vote_count);

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
    await supabase.from("suggestions").insert({
      gala_id: galaId,
      user_id: userId,
      type: activeType,
      content: newContent.trim(),
      link: newLink.trim() || null,
      event_date: newDate || null,
      start_time: newStartTime || null,
      end_time: newEndTime || null,
    });
    setNewContent("");
    setNewLink("");
    setNewDate("");
    setNewStartTime("");
    setNewEndTime("");
    setShowForm(false);
    setSubmitting(false);
    onRefresh();
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
            <h3 className="text-2xl font-black mb-4">Add Suggestion</h3>
            <form onSubmit={handleAddSuggestion} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveType(t)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 font-bold text-sm transition-all ${
                      activeType === t ? "border-[#ff5833] bg-[#ff5833]/5" : "border-slate-200 hover:border-slate-900"
                    }`}
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
              {(activeType === "location" || activeType === "food" || activeType === "activity") && (
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder={activeType === "location" ? "🗺️ Google Maps link (recommended)" : "🔗 Link (optional)"}
                  className="w-full px-4 py-3 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
                />
              )}
              {activeType === "date" && (
                <div className="space-y-3">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-3 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      placeholder="Start time"
                      className="w-full px-4 py-3 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
                    />
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      placeholder="End time (optional)"
                      className="w-full px-4 py-3 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 bg-[#ff5833] text-white font-black rounded-lg border-2 border-slate-900 btn-push disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Suggestion"}
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
        <div className="text-center py-20 bg-white rounded-xl bold-border">
          <span className="material-symbols-outlined text-6xl text-slate-300 block mb-4">lightbulb</span>
          <p className="text-xl font-black text-slate-400">No suggestions yet</p>
          <p className="text-slate-400 font-medium mt-1">Be the first to suggest a {activeType}!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-xl bold-border overflow-hidden flex flex-col transition-all ${s.user_has_voted ? "shadow-playful-primary" : "shadow-playful-sm"}`}
            >
              <div className="h-40 bg-gradient-to-br from-[#ff5833]/10 to-slate-100 flex items-center justify-center border-b-3 border-slate-900 relative">
                <span className="material-symbols-outlined text-6xl text-slate-300">
                  {TYPE_META[s.type]?.icon || "lightbulb"}
                </span>
                <div className="absolute top-3 right-3 bg-white px-3 py-1 border-2 border-slate-900 rounded-full font-bold text-sm">
                  {s.vote_count} VOTES
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className={`text-xs font-black px-2 py-0.5 rounded-full border w-fit mb-2 ${TYPE_META[s.type]?.color}`}>
                  {s.type.toUpperCase()}
                </p>
                <p className="font-bold text-slate-800 flex-1 leading-snug">{s.content}</p>
                {s.link && (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 bg-blue-50 text-blue-700 border-2 border-blue-400 font-bold text-sm px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">link</span>
                    {s.type === "location" ? "View on Maps" : "View Link"}
                  </a>
                )}
                {s.type === "date" && (s.event_date || s.start_time) && (
                  <div className="mt-3 bg-green-50 border-2 border-green-400 rounded-lg p-3">
                    {s.event_date && (
                      <div className="flex items-center gap-2 font-bold text-green-800 text-sm">
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        {new Date(s.event_date).toLocaleDateString()}
                      </div>
                    )}
                    {s.start_time && (
                      <div className="flex items-center gap-2 font-bold text-green-800 text-sm mt-1">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        {s.start_time}{s.end_time && ` - ${s.end_time}`}
                      </div>
                    )}
                  </div>
                )}
                {s.author_name && (
                  <p className="text-xs text-slate-400 font-medium mt-2">by {s.author_name}</p>
                )}
                <div className="mt-4">
                  <button
                    onClick={() => handleVote(s.id, s.user_has_voted)}
                    className={`w-full py-2.5 rounded-lg border-2 border-slate-900 font-black flex items-center justify-center gap-2 transition-all btn-push ${
                      s.user_has_voted
                        ? "bg-[#ff5833] text-white"
                        : "bg-white text-slate-900 hover:bg-[#ff5833]/10"
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
    </div>
  );
}
