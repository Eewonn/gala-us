"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GalaWithMembers, Task, Expense, Suggestion } from "@/types/database";

interface Props {
  gala: GalaWithMembers;
  tasks: Task[];
  expenses: Expense[];
  suggestions: Suggestion[];
  inviteLink: string;
  userId: string;
  onRefresh: () => void;
}

export default function OverviewTab({ gala, tasks, expenses, suggestions, inviteLink, userId, onRefresh }: Props) {
  const [copied, setCopied] = useState(false);
  const [advancingStage, setAdvancingStage] = useState(false);

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const topSuggestion = suggestions[0];

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stageSteps = ["planning", "confirmed", "live", "completed"];
  const currentStageIdx = stageSteps.indexOf(gala.stage);
  const isOrganizer = gala.organizer_id === userId;
  const canAdvance = currentStageIdx < stageSteps.length - 1;

  const handleAdvanceStage = async () => {
    if (!canAdvance || !isOrganizer) return;
    
    const nextStage = stageSteps[currentStageIdx + 1] as "planning" | "confirmed" | "live" | "completed";
    const confirmMessage = `Are you sure you want to move to the "${nextStage}" stage? This will update the event status for all members.`;
    
    if (!confirm(confirmMessage)) return;
    
    setAdvancingStage(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("galas")
      .update({ stage: nextStage })
      .eq("id", gala.id);
    
    if (error) {
      console.error("Failed to advance stage:", error);
      alert("Failed to update stage. Please try again.");
      setAdvancingStage(false);
      return;
    }
    
    setAdvancingStage(false);
    onRefresh();
  };

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Members", value: gala.members.length, icon: "group", color: "bg-blue-100 text-blue-700" },
          { label: "Suggestions", value: suggestions.length, icon: "lightbulb", color: "bg-yellow-100 text-yellow-700" },
          { label: "Tasks Done", value: `${doneTasks}/${tasks.length}`, icon: "task_alt", color: "bg-green-100 text-green-700" },
          { label: "Total Spent", value: `$${totalExpenses.toFixed(0)}`, icon: "payments", color: "bg-purple-100 text-purple-700" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl bold-border p-5 shadow-playful-sm">
            <div className={`size-10 rounded-lg flex items-center justify-center ${stat.color} mb-3`}>
              <span className="material-symbols-outlined text-xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-black">{stat.value}</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Stage */}
          <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black uppercase tracking-wider">Event Stage</h3>
              {isOrganizer && canAdvance && (
                <button
                  onClick={handleAdvanceStage}
                  disabled={advancingStage}
                  className="bg-[#ff5833] hover:bg-[#ff6b47] text-white font-black px-4 py-2 rounded-lg border-2 border-slate-900 btn-push text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {advancingStage ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      Advancing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      Move to {stageSteps[currentStageIdx + 1]}
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="relative pt-2">
              <div className="absolute top-4 left-0 w-full h-1 bg-slate-200 z-0" />
              <div
                className="absolute top-4 left-0 h-1 bg-[#ff5833] z-0 transition-all"
                style={{ width: `${(currentStageIdx / (stageSteps.length - 1)) * 100}%` }}
              />
              <div className="relative z-10 flex justify-between">
                {stageSteps.map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center border-3 ${
                        i <= currentStageIdx
                          ? "bg-[#ff5833] border-[#ff5833]"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      {i < currentStageIdx && (
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                      )}
                      {i === currentStageIdx && (
                        <span className="material-symbols-outlined text-white text-sm">rocket_launch</span>
                      )}
                    </div>
                    <span className={`text-xs font-black uppercase ${i === currentStageIdx ? "text-[#ff5833]" : i < currentStageIdx ? "text-slate-700" : "text-slate-400"}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm">
            <h3 className="text-lg font-black uppercase tracking-wider mb-4">
              Participants ({gala.members.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {gala.members.map(({ user, role }) => (
                <div key={user.id} className="flex flex-col items-center gap-2 p-3 bg-[#f8f6f5] rounded-xl bold-border">
                  <div className="size-12 rounded-full bg-[#ff5833] bold-border flex items-center justify-center">
                    <span className="text-white font-black text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="font-black text-xs truncate w-full text-center">{user.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${role === "organizer" ? "bg-[#ff5833]/10 text-[#ff5833] border border-[#ff5833]" : "bg-slate-100 text-slate-600 border border-slate-300"}`}>
                    {role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent tasks */}
          {tasks.length > 0 && (
            <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm">
              <h3 className="text-lg font-black uppercase tracking-wider mb-4">Recent Tasks</h3>
              <div className="flex flex-col gap-3">
                {tasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200">
                    <div className={`size-6 rounded-full border-2 flex items-center justify-center shrink-0 ${task.status === "done" ? "bg-green-500 border-green-500" : task.status === "doing" ? "bg-yellow-400 border-yellow-400" : "bg-white border-slate-300"}`}>
                      {task.status === "done" && (
                        <span className="material-symbols-outlined text-white text-xs">check</span>
                      )}
                    </div>
                    <span className={`font-bold flex-1 ${task.status === "done" ? "line-through text-slate-400" : ""}`}>{task.title}</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${task.status === "todo" ? "bg-slate-100 text-slate-500" : task.status === "doing" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Invite card */}
          <div className="bg-[#ff5833] rounded-xl bold-border p-6 shadow-playful text-white">
            <h3 className="text-lg font-black uppercase tracking-wider mb-2">Invite Code</h3>
            <p className="text-4xl font-black tracking-widest mb-4">{gala.invite_code}</p>
            <button
              onClick={copyInvite}
              className="w-full h-11 bg-white text-[#ff5833] font-black rounded-lg border-2 border-[#23130f] flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{copied ? "check" : "content_copy"}</span>
              {copied ? "Copied!" : "Copy Invite Link"}
            </button>
          </div>

          {/* Decision mode */}
          <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm">
            <h3 className="text-lg font-black uppercase tracking-wider mb-3">Decision Mode</h3>
            <div className="flex items-center gap-3 p-3 bg-[#ff5833]/5 rounded-lg border-2 border-[#ff5833]">
              <span className="material-symbols-outlined text-[#ff5833]">
                {gala.decision_type === "majority" ? "how_to_vote" : gala.decision_type === "organizer" ? "person_check" : "casino"}
              </span>
              <div>
                <p className="font-black capitalize">{gala.decision_type} Vote</p>
                <p className="text-xs text-slate-500 font-medium">
                  {gala.decision_type === "majority" && "Most votes wins"}
                  {gala.decision_type === "organizer" && "Organizer decides"}
                  {gala.decision_type === "random" && "Random from top picks"}
                </p>
              </div>
            </div>
          </div>

          {/* Top suggestion */}
          {topSuggestion && (
            <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm">
              <h3 className="text-lg font-black uppercase tracking-wider mb-3">Top Suggestion</h3>
              <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-400">
                <span className="text-xs font-black uppercase text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-400">
                  {topSuggestion.type}
                </span>
                <p className="font-bold mt-2 text-slate-800">{topSuggestion.content}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
