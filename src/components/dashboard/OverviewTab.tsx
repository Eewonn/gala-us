"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/ConfirmDialog";
import AlertDialog from "@/components/AlertDialog";
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
  const [changingStage, setChangingStage] = useState(false);
  const [showConfirmChange, setShowConfirmChange] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [targetStage, setTargetStage] = useState<"planning" | "confirmed" | "live" | "completed">("planning");

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

  const handleStageClick = (stage: string) => {
    if (!isOrganizer) return;
    if (stage === gala.stage) return; // Already at this stage
    
    setTargetStage(stage as "planning" | "confirmed" | "live" | "completed");
    setShowConfirmChange(true);
  };

  const confirmStageChange = async () => {
    setShowConfirmChange(false);
    setChangingStage(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("galas")
      .update({ stage: targetStage })
      .eq("id", gala.id);
    
    if (error) {
      console.error("Failed to change stage:", error);
      setChangingStage(false);
      setShowErrorAlert(true);
      return;
    }
    
    setChangingStage(false);
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
              {isOrganizer && (
                <span className="text-xs font-bold text-slate-500">Click a stage to change</span>
              )}
            </div>
            <div className="relative pt-4 pb-2 px-4">
              {/* Background line */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200" />
              {/* Progress line */}
              <div
                className="absolute top-8 left-0 h-1 bg-[#ff5833] transition-all duration-300"
                style={{ width: `${(currentStageIdx / (stageSteps.length - 1)) * 100}%` }}
              />
              <div className="relative z-10 flex justify-between -mx-4">
                {stageSteps.map((step, i) => (
                  <button
                    key={step}
                    onClick={() => handleStageClick(step)}
                    disabled={!isOrganizer || changingStage}
                    className={`flex flex-col items-center gap-3 transition-all ${
                      isOrganizer && step !== gala.stage ? "cursor-pointer hover:scale-110" : "cursor-default"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <div
                      className={`size-8 rounded-full flex items-center justify-center border-3 transition-all shadow-sm ${
                        i <= currentStageIdx
                          ? "border-[#ff5833] bg-[#ff5833]"
                          : "border-slate-300 bg-white"
                      } ${
                        isOrganizer && step !== gala.stage ? "hover:shadow-[0_0_0_4px_rgba(255,88,51,0.2)]" : ""
                      }`}
                    >
                      {i < currentStageIdx && (
                        <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                      )}
                      {i === currentStageIdx && (
                        <span className="material-symbols-outlined text-white text-sm">rocket_launch</span>
                      )}
                    </div>
                    <span className={`text-xs font-black uppercase tracking-wide ${i === currentStageIdx ? "text-[#ff5833]" : i < currentStageIdx ? "text-slate-900" : "text-slate-400"}`}>
                      {step}
                    </span>
                  </button>
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

      {/* Confirm Stage Change Dialog */}
      <ConfirmDialog
        isOpen={showConfirmChange}
        title="Change Event Stage"
        message={`Are you sure you want to change the stage to "${targetStage}"? This will update the event status for all members.`}
        confirmText="Yes, Change Stage"
        cancelText="Cancel"
        type="warning"
        onConfirm={confirmStageChange}
        onCancel={() => setShowConfirmChange(false)}
      />

      {/* Error Alert Dialog */}
      <AlertDialog
        isOpen={showErrorAlert}
        title="Failed to Update Stage"
        message="Failed to update stage. Please try again."
        buttonText="OK"
        type="error"
        onClose={() => setShowErrorAlert(false)}
      />
    </div>
  );
}
