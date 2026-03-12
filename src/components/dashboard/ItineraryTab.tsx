"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ItineraryItemWithCreator } from "@/types/database";

interface Props {
  galaId: string;
  userId: string;
  items: ItineraryItemWithCreator[];
  onRefresh: () => void;
}

export default function ItineraryTab({ galaId, userId, items, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTime, setNewTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sort items by scheduled_time, then by order_index
  const sorted = [...items].sort((a, b) => {
    const timeCompare = a.scheduled_time.localeCompare(b.scheduled_time);
    if (timeCompare !== 0) return timeCompare;
    return a.order_index - b.order_index;
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTime) return;
    setSubmitting(true);
    const supabase = createClient();

    // datetime-local gives us "YYYY-MM-DDTHH:mm" which represents local time
    // Append seconds and timezone to create proper ISO string
    const localDateTime = new Date(newTime + ':00'); // Add seconds
    const scheduledTime = localDateTime.toISOString(); // Convert to UTC for storage

    // Get the next order_index for this time slot
    const itemsAtTime = items.filter((i) => {
      const itemLocalTime = new Date(i.scheduled_time);
      return itemLocalTime.getTime() === localDateTime.getTime();
    });
    const nextOrderIndex = itemsAtTime.length > 0 
      ? Math.max(...itemsAtTime.map((i) => i.order_index)) + 1 
      : 0;

    await supabase.from("itinerary_items").insert({
      gala_id: galaId,
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      scheduled_time: scheduledTime,
      order_index: nextOrderIndex,
      created_by: userId,
    });

    setNewTitle("");
    setNewDescription("");
    setNewTime("");
    setShowForm(false);
    setSubmitting(false);
    onRefresh();
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Remove this item from the itinerary?")) return;
    const supabase = createClient();
    await supabase.from("itinerary_items").delete().eq("id", itemId);
    onRefresh();
  };

  // Group items by date first, then by time
  const groupedByDate = sorted.reduce((acc, item) => {
    // Parse the timestamp correctly
    const date = new Date(item.scheduled_time);
    const dateKey = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeKey = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
    
    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }
    if (!acc[dateKey][timeKey]) {
      acc[dateKey][timeKey] = [];
    }
    acc[dateKey][timeKey].push(item);
    return acc;
  }, {} as Record<string, Record<string, ItineraryItemWithCreator[]>>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black leading-none">
            <span className="text-[#ff5833] italic">Event</span> Schedule
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Build your timeline. Plan the perfect day, minute by minute.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#ff5833] text-white font-black px-6 py-3 rounded-xl border-3 border-slate-900 shadow-playful-sm btn-push flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span>
          ADD ITEM
        </button>
      </div>

      {/* Add item modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl bold-border shadow-playful w-full max-w-md p-6">
            <h3 className="text-2xl font-black mb-4">Add Itinerary Item</h3>
            <form onSubmit={handleAddItem} className="flex flex-col gap-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                placeholder="Title (e.g., Dinner, Group Photo)"
                className="w-full px-4 py-3 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                placeholder="Description (optional)"
                className="w-full px-4 py-3 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5] resize-none"
              />
              <input
                type="datetime-local"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
                className="w-full px-4 py-3 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 bg-[#ff5833] text-white font-black rounded-lg border-2 border-slate-900 btn-push disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add to Schedule"}
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

      {/* Timeline */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl bold-border">
          <span className="material-symbols-outlined text-6xl text-slate-300 block mb-4">event_note</span>
          <p className="text-xl font-black text-slate-400">No schedule yet</p>
          <p className="text-slate-400 font-medium mt-1">Add items to build your event timeline</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedByDate).map(([date, timeGroups]) => (
            <div key={date} className="space-y-6">
              {/* Date Header */}
              <div className="sticky top-20 z-10 bg-[#f8f6f5] py-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-xl border-3 border-slate-900 shadow-playful-sm">
                    <span className="material-symbols-outlined">calendar_today</span>
                    <h3 className="text-xl font-black">{date}</h3>
                  </div>
                  <div className="flex-1 h-1 bg-slate-200 rounded-full"></div>
                </div>
              </div>

              {/* Activities for this date */}
              <div className="space-y-6 ml-4">
                {Object.entries(timeGroups).map(([time, timeItems]) => (
                  <div key={time} className="flex gap-4">
                    <div className="flex-shrink-0 w-28 text-right pt-1">
                      <div className="bg-[#ff5833] text-white font-black px-4 py-2 rounded-lg border-2 border-slate-900 text-base inline-block">
                        {time}
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 pb-4">
                      {timeItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl bold-border p-5 shadow-playful-sm hover:shadow-playful transition-all"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <h4 className="font-black text-lg text-slate-900">{item.title}</h4>
                              {item.description && (
                                <p className="text-slate-600 font-medium mt-1 leading-snug">{item.description}</p>
                              )}
                              {item.creator_name && (
                                <p className="text-xs text-slate-400 font-medium mt-2">
                                  Added by {item.creator_name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
