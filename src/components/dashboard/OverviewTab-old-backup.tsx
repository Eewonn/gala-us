"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/ConfirmDialog";
import AlertDialog from "@/components/AlertDialog";
import type { GalaWithMembers, TaskWithAssignee, ExpenseWithDetails, SuggestionWithVotes } from "@/types/database";

interface Props {
  gala: GalaWithMembers;
  tasks: TaskWithAssignee[];
  expenses: ExpenseWithDetails[];
  suggestions: SuggestionWithVotes[];
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

  // Get current user info
  const currentUser = gala.members.find(m => m.user_id === userId);
  const userName = currentUser?.user.name || "Guest";
  
  // Personal metrics
  const myTasks = tasks.filter(t => t.assigned_to === userId);
  const myPendingTasks = myTasks.filter(t => t.status !== "done");
  const myCompletedTasks = myTasks.filter(t => t.status === "done").length;
  
  // Calculate what user owes
  const myPendingPayments = expenses.reduce((sum, expense) => {
    const myAssignment = expense.assignments.find(a => a.user_id === userId && a.status === "pending");
    return sum + (myAssignment ? Number(myAssignment.amount) : 0);
  }, 0);
  
  // Check voting participation
  const unvotedSuggestions = suggestions.filter(s => !s.user_has_voted && s.user_id !== userId);
  
  // General metrics
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
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#ff5833] to-[#ff7a5c] rounded-xl bold-border p-6 shadow-playful text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black mb-1">Welcome back, {userName}! 👋</h2>
            <p className="text-white/90 font-medium">Here's what's happening with {gala.title}</p>
          </div>
          <div className="hidden md:block size-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center bold-border">
            <span className="text-white font-black text-2xl">{userName.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Action items for this user */}
      {(myPendingTasks.length > 0 || myPendingPayments > 0 || unvotedSuggestions.length > 0) && (
        <div className="bg-yellow-50 border-3 border-yellow-400 rounded-xl p-6 shadow-playful-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-yellow-600 text-2xl">notifications_active</span>
            <h3 className="text-lg font-black uppercase tracking-wider text-yellow-900">Action Items</h3>
          </div>
          <div className="space-y-3">
            {myPendingTasks.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-yellow-400">
                <span className="material-symbols-outlined text-yellow-600">task</span>
                <div className="flex-1">
                  <p className="font-black text-sm">You have {myPendingTasks.length} task{myPendingTasks.length !== 1 ? 's' : ''} to complete</p>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">Check the Tasks tab to update your progress</p>
                </div>
              </div>
            )}
            {myPendingPayments > 0 && (
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-yellow-400">
                <span className="material-symbols-outlined text-yellow-600">payment</span>
                <div className="flex-1">
                  <p className="font-black text-sm">You owe ${myPendingPayments.toFixed(2)}</p>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">Visit the Budget tab to mark payments as paid</p>
                </div>
              </div>
            )}
            {unvotedSuggestions.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-yellow-400">
                <span className="material-symbols-outlined text-yellow-600">how_to_vote</span>
                <div className="flex-1">
                  <p className="font-black text-sm">{unvotedSuggestions.length} suggestion{unvotedSuggestions.length !== 1 ? 's' : ''} awaiting your vote</p>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">Go to Voting tab to cast your votes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats row - Personalized - Personalized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Your Tasks", value: `${myCompletedTasks}/${myTasks.length}`, icon: "task_alt", color: "bg-green-100 text-green-700", sublabel: "completed" },
          { label: "You Owe", value: myPendingPayments > 0 ? `$${myPendingPayments.toFixed(0)}` : "$0", icon: "account_balance_wallet", color: "bg-purple-100 text-purple-700", sublabel: "pending" },
          { label: "Team Progress", value: `${doneTasks}/${tasks.length}`, icon: "groups", color: "bg-blue-100 text-blue-700", sublabel: "tasks done" },
          { label: "Total Budget", value: `$${totalExpenses.toFixed(0)}`, icon: "payments", color: "bg-orange-100 text-orange-700", sublabel: "spent" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl bold-border p-5 shadow-playful-sm">
            <div className={`size-10 rounded-lg flex items-center justify-center ${stat.color} mb-3`}>
              <span className="material-symbols-outlined text-xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-black">{stat.value}</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
            <p className="text-xs font-medium text-slate-400">{stat.sublabel}</p>
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

          {/* Your tasks */}
          {myTasks.length > 0 && (
            <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm">
              <h3 className="text-lg font-black uppercase tracking-wider mb-4">Your Tasks</h3>
              <div className="flex flex-col gap-3">
                {myTasks.slice(0, 4).map((task) => (
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
              {myTasks.length === 0 && (
                <p className="text-center text-slate-400 font-medium py-4">No tasks assigned to you yet</p>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Your role card */}
          <div className={`rounded-xl bold-border p-6 shadow-playful text-white ${isOrganizer ? "bg-gradient-to-br from-[#ff5833] to-[#ff6b47]" : "bg-gradient-to-br from-slate-700 to-slate-800"}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-2xl">{isOrganizer ? "workspace_premium" : "person"}</span>
              <h3 className="text-lg font-black uppercase tracking-wider">Your Role</h3>
            </div>
            <p className="text-3xl font-black mb-2">{isOrganizer ? "Organizer" : "Member"}</p>
            <p className="text-white/80 text-sm font-medium">
              {isOrganizer ? "You can manage all aspects of this event" : `Joined ${gala.members.length > 1 ? `with ${gala.members.length - 1} other${gala.members.length > 2 ? 's' : ''}` : "this event"}`}
            </p>
          </div>

          {/* Your contributions */}
          <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm">
            <h3 className="text-lg font-black uppercase tracking-wider mb-4">Your Impact</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">task_alt</span>
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900">Tasks Completed</p>
                    <p className="text-xs text-slate-500 font-medium">{myTasks.length > 0 ? `${myCompletedTasks} of ${myTasks.length}` : "No tasks yet"}</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-green-600">{myCompletedTasks}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">how_to_vote</span>
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900">Votes Cast</p>
                    <p className="text-xs text-slate-500 font-medium">{suggestions.length > 0 ? `on ${suggestions.filter(s => s.user_has_voted).length} suggestion${suggestions.filter(s => s.user_has_voted).length !== 1 ? 's' : ''}` : "No votes yet"}</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-blue-600">{suggestions.filter(s => s.user_has_voted).length}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">lightbulb</span>
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900">Suggestions Made</p>
                    <p className="text-xs text-slate-500 font-medium">{suggestions.filter(s => s.user_id === userId).length > 0 ? "Helping plan" : "Add your ideas"}</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-purple-600">{suggestions.filter(s => s.user_id === userId).length}</span>
              </div>
            </div>
          </div>

          {/* Invite card */}
          <div className="bg-[#ff5833] rounded-xl bold-border p-6 shadow-playful text-white">
            <h3 className="text-lg font-black uppercase tracking-wider mb-2">Invite Friends</h3>
            <p className="text-sm text-white/80 font-medium mb-3">Share code: <span className="font-black text-2xl tracking-wider">{gala.invite_code}</span></p>
            <button
              onClick={copyInvite}
              className="w-full h-11 bg-white text-[#ff5833] font-black rounded-lg border-2 border-[#23130f] flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{copied ? "check" : "content_copy"}</span>
              {copied ? "Copied!" : "Copy Invite Link"}
            </button>
          </div>

          {/* Top suggestion */}
          {topSuggestion && (
            <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm">
              <h3 className="text-lg font-black uppercase tracking-wider mb-3">Leading Suggestion</h3>
              <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-400">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black uppercase text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-400">
                    {topSuggestion.type}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{topSuggestion.vote_count} vote{topSuggestion.vote_count !== 1 ? 's' : ''}</span>
                </div>
                <p className="font-bold text-slate-800">{topSuggestion.content}</p>
                {topSuggestion.author_name && (
                  <p className="text-xs text-slate-500 font-medium mt-2">by {topSuggestion.author_name}</p>
                )}
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
