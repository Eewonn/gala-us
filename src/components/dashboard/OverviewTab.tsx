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
  userId: string;
  onRefresh: () => void;
}

export default function OverviewTab({ gala, tasks, expenses, suggestions, userId, onRefresh }: Props) {
  const [changingStage, setChangingStage] = useState(false);
  const [showConfirmChange, setShowConfirmChange] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
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

  const stageSteps = ["planning", "confirmed", "live", "completed"];
  const currentStageIdx = stageSteps.indexOf(gala.stage);
  const isOrganizer = gala.organizer_id === userId;

  const handleStageClick = (stage: string) => {
    if (!isOrganizer) return;
    if (stage === gala.stage) return;
    
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
    <div className="space-y-4">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* === ROW 1: PERSONAL INFO === */}
        
        {/* Welcome banner - spans 2 cols */}
        <div className="md:col-span-2 bg-gradient-to-r from-[#ff5833] to-[#ff7a5c] rounded-xl bold-border p-5 shadow-playful text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-black mb-1 truncate">Welcome back, {userName}!</h2>
              <p className="text-white/90 font-medium text-sm truncate">Here's what's happening with {gala.title}</p>
            </div>
            <div className="hidden md:flex size-12 shrink-0 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center bold-border">
              <span className="text-white font-black text-lg">{userName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Your role card - 1 col */}
        <div className={`rounded-xl bold-border p-5 shadow-playful text-white ${isOrganizer ? "bg-gradient-to-br from-[#ff5833] to-[#ff6b47]" : "bg-gradient-to-br from-slate-700 to-slate-800"}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-lg">{isOrganizer ? "workspace_premium" : "person"}</span>
            <h3 className="text-xs font-black uppercase tracking-wider">Your Role</h3>
          </div>
          <p className="text-2xl font-black mb-1">{isOrganizer ? "Organizer" : "Member"}</p>
          <p className="text-white/80 text-xs font-medium line-clamp-2">
            {isOrganizer ? "Manage all aspects" : `${gala.members.length} members`}
          </p>
        </div>

        {/* Your Impact - 1 col */}
        <div className="bg-white rounded-xl bold-border p-5 shadow-playful-sm">
          <h3 className="text-sm font-black uppercase tracking-wider mb-3">Your Impact</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">task_alt</span>
                </div>
                <div>
                  <p className="font-black text-[10px] text-slate-900 uppercase">Tasks Done</p>
                  <p className="text-[9px] text-slate-500 font-medium">{myTasks.length > 0 ? `${myCompletedTasks} of ${myTasks.length}` : "None yet"}</p>
                </div>
              </div>
              <span className="text-lg font-black text-green-600">{myCompletedTasks}</span>
            </div>
            
            <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">how_to_vote</span>
                </div>
                <div>
                  <p className="font-black text-[10px] text-slate-900 uppercase">Votes</p>
                  <p className="text-[9px] text-slate-500 font-medium">{suggestions.filter(s => s.user_has_voted).length} cast</p>
                </div>
              </div>
              <span className="text-lg font-black text-blue-600">{suggestions.filter(s => s.user_has_voted).length}</span>
            </div>
            
            <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">lightbulb</span>
                </div>
                <div>
                  <p className="font-black text-[10px] text-slate-900 uppercase">Ideas</p>
                  <p className="text-[9px] text-slate-500 font-medium">{suggestions.filter(s => s.user_id === userId).length} suggested</p>
                </div>
              </div>
              <span className="text-lg font-black text-purple-600">{suggestions.filter(s => s.user_id === userId).length}</span>
            </div>
          </div>
        </div>

        {/* === ROW 2: BIG PICTURE STATS === */}

        {/* Your Tasks Stat - with action-oriented empty state */}
        <div className="bg-white rounded-xl bold-border p-4 shadow-playful-sm">
          <div className="size-9 rounded-lg flex items-center justify-center bg-green-100 text-green-700 mb-2">
            <span className="material-symbols-outlined text-base">task_alt</span>
          </div>
          {myTasks.length === 0 ? (
            <>
              <p className="text-lg font-black leading-none text-slate-400">No tasks yet</p>
              <p className="text-[9px] font-bold text-green-600 uppercase tracking-wide mt-1">Check Tasks tab</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-black leading-none">{myCompletedTasks}/{myTasks.length}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1 truncate">Your Tasks</p>
            </>
          )}
        </div>

        {/* You Owe Stat - with satisfying empty state */}
        <div className="bg-white rounded-xl bold-border p-4 shadow-playful-sm">
          <div className="size-9 rounded-lg flex items-center justify-center bg-purple-100 text-purple-700 mb-2">
            <span className="material-symbols-outlined text-base">account_balance_wallet</span>
          </div>
          {myPendingPayments === 0 ? (
            <>
              <p className="text-lg font-black leading-none text-green-600">All settled!</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">You Owe</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-black leading-none text-purple-700">${myPendingPayments.toFixed(0)}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1 truncate">You Owe</p>
            </>
          )}
        </div>

        {/* Team Progress Stat - with encouraging empty state */}
        <div className="bg-white rounded-xl bold-border p-4 shadow-playful-sm">
          <div className="size-9 rounded-lg flex items-center justify-center bg-blue-100 text-blue-700 mb-2">
            <span className="material-symbols-outlined text-base">groups</span>
          </div>
          {tasks.length === 0 ? (
            <>
              <p className="text-lg font-black leading-none text-slate-400">Add tasks!</p>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wide mt-1">Team Progress</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-black leading-none">{doneTasks}/{tasks.length}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1 truncate">Team Progress</p>
            </>
          )}
        </div>

        {/* Total Budget Stat - with empty state */}
        <div className="bg-white rounded-xl bold-border p-4 shadow-playful-sm">
          <div className="size-9 rounded-lg flex items-center justify-center bg-orange-100 text-orange-700 mb-2">
            <span className="material-symbols-outlined text-base">payments</span>
          </div>
          {totalExpenses === 0 ? (
            <>
              <p className="text-lg font-black leading-none text-slate-400">No expenses</p>
              <p className="text-[9px] font-bold text-orange-600 uppercase tracking-wide mt-1">Total Budget</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-black leading-none">${totalExpenses.toFixed(0)}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1 truncate">Total Budget</p>
            </>
          )}
        </div>

        {/* Event Stage - spans 4 cols */}
        <div className="md:col-span-2 lg:col-span-4 bg-white rounded-xl bold-border p-5 shadow-playful-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider">Event Stage</h3>
            {isOrganizer && (
              <span className="text-[10px] font-bold text-slate-500">Click to change</span>
            )}
          </div>
          <div className="relative pt-3 pb-2 px-3">
            <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200" />
            <div
              className="absolute top-6 left-0 h-1 bg-[#ff5833] transition-all duration-300"
              style={{ width: `${(currentStageIdx / (stageSteps.length - 1)) * 100}%` }}
            />
            <div className="relative z-10 flex justify-between -mx-3">
              {stageSteps.map((step, i) => (
                <button
                  key={step}
                  onClick={() => handleStageClick(step)}
                  disabled={!isOrganizer || changingStage}
                  className={`flex flex-col items-center gap-2 transition-all ${
                    isOrganizer && step !== gala.stage ? "cursor-pointer hover:scale-110" : "cursor-default"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <div
                    className={`size-7 rounded-full flex items-center justify-center border-3 transition-all shadow-sm ${
                      i <= currentStageIdx
                        ? "border-[#ff5833] bg-[#ff5833]"
                        : "border-slate-300 bg-white"
                    } ${
                      isOrganizer && step !== gala.stage ? "hover:shadow-[0_0_0_4px_rgba(255,88,51,0.2)]" : ""
                    }`}
                  >
                    {i < currentStageIdx && (
                      <span className="material-symbols-outlined text-white text-xs font-bold">check</span>
                    )}
                    {i === currentStageIdx && (
                      <span className="material-symbols-outlined text-white text-xs">rocket_launch</span>
                    )}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wide ${i === currentStageIdx ? "text-[#ff5833]" : i < currentStageIdx ? "text-slate-900" : "text-slate-400"}`}>
                    {step}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* === ROW 3: ACTIONABLES & TEAM === */}

        {/* Action items - spans full width when present */}
        {(myPendingTasks.length > 0 || myPendingPayments > 0 || unvotedSuggestions.length > 0) && (
          <div className="md:col-span-2 lg:col-span-4 bg-yellow-50 border-3 border-yellow-400 rounded-xl p-4 shadow-playful-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-yellow-600 text-lg">notifications_active</span>
              <h3 className="text-sm font-black uppercase tracking-wider text-yellow-900">Action Items</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {myPendingTasks.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-white rounded-lg border-2 border-yellow-400">
                  <span className="material-symbols-outlined text-yellow-600 text-base">task</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xs">{myPendingTasks.length} task{myPendingTasks.length !== 1 ? 's' : ''} pending</p>
                    <p className="text-[10px] text-slate-600 font-medium mt-0.5 truncate">Check Tasks tab</p>
                  </div>
                </div>
              )}
              {myPendingPayments > 0 && (
                <div className="flex items-start gap-2 p-3 bg-white rounded-lg border-2 border-yellow-400">
                  <span className="material-symbols-outlined text-yellow-600 text-base">payment</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xs">${myPendingPayments.toFixed(2)} owed</p>
                    <p className="text-[10px] text-slate-600 font-medium mt-0.5 truncate">Visit Budget tab</p>
                  </div>
                </div>
              )}
              {unvotedSuggestions.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-white rounded-lg border-2 border-yellow-400">
                  <span className="material-symbols-outlined text-yellow-600 text-base">how_to_vote</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xs">{unvotedSuggestions.length} vote{unvotedSuggestions.length !== 1 ? 's' : ''} needed</p>
                    <p className="text-[10px] text-slate-600 font-medium mt-0.5 truncate">Go to Voting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leading Suggestion - spans 2 cols */}
        {topSuggestion && (
          <div className="md:col-span-2 bg-white rounded-xl bold-border p-5 shadow-playful-sm">
            <h3 className="text-sm font-black uppercase tracking-wider mb-3">Leading Suggestion</h3>
            <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-400">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-400">
                  {topSuggestion.type}
                </span>
                <span className="text-[10px] font-bold text-slate-500">{topSuggestion.vote_count} vote{topSuggestion.vote_count !== 1 ? 's' : ''}</span>
              </div>
              <p className="font-bold text-sm text-slate-800 line-clamp-2">{topSuggestion.content}</p>
              {topSuggestion.author_name && (
                <p className="text-xs text-slate-500 font-medium mt-2">by {topSuggestion.author_name}</p>
              )}
            </div>
          </div>
        )}

        {/* Participants - spans 2 cols */}
        <div className="md:col-span-2 bg-white rounded-xl bold-border p-5 shadow-playful-sm">
          <h3 className="text-sm font-black uppercase tracking-wider mb-3">
            Participants ({gala.members.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {gala.members.slice(0, 8).map(({ user, role }) => (
              <div key={user.id} className="flex flex-col items-center gap-2 p-3 bg-[#f8f6f5] rounded-lg bold-border">
                <div className="size-12 rounded-full bg-[#ff5833] bold-border flex items-center justify-center">
                  <span className="text-white font-black text-base">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="w-full text-center">
                  <p className="font-black text-[10px] truncate">{user.name}</p>
                  <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-black uppercase mt-1 ${
                    role === "organizer" 
                      ? "bg-[#ff5833]/10 text-[#ff5833] border border-[#ff5833]" 
                      : "bg-slate-100 text-slate-600 border border-slate-300"
                  }`}>
                    {role === "organizer" ? "Organizer" : "Member"}
                  </span>
                </div>
              </div>
            ))}
            {gala.members.length > 8 && (
              <button
                onClick={() => setShowAllParticipants(true)}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-[#ff5833]/5 rounded-lg bold-border hover:bg-[#ff5833]/10 transition-colors cursor-pointer"
              >
                <div className="size-12 rounded-full bg-[#ff5833]/20 bold-border flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ff5833] text-xl">group_add</span>
                </div>
                <div className="w-full text-center">
                  <p className="font-black text-[10px] text-[#ff5833]">View All</p>
                  <span className="inline-block text-[9px] px-2 py-0.5 rounded-full font-black uppercase mt-1 bg-[#ff5833]/10 text-[#ff5833] border border-[#ff5833]">
                    +{gala.members.length - 8}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Your Tasks - spans 2 cols if present */}
        {myTasks.length > 0 && (
          <div className="md:col-span-2 bg-white rounded-xl bold-border p-5 shadow-playful-sm">
            <h3 className="text-sm font-black uppercase tracking-wider mb-3">Your Tasks</h3>
            <div className="flex flex-col gap-2">
              {myTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-2 p-2.5 rounded-lg border-2 border-slate-200">
                  <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.status === "done" ? "bg-green-500 border-green-500" : task.status === "doing" ? "bg-yellow-400 border-yellow-400" : "bg-white border-slate-300"}`}>
                    {task.status === "done" && (
                      <span className="material-symbols-outlined text-white text-[10px]">check</span>
                    )}
                  </div>
                  <span className={`font-bold text-xs flex-1 truncate ${task.status === "done" ? "line-through text-slate-400" : ""}`}>{task.title}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${task.status === "todo" ? "bg-slate-100 text-slate-500" : task.status === "doing" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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

      {/* All Participants Modal */}
      {showAllParticipants && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAllParticipants(false)}
          >
            <div 
              className="bg-white rounded-xl bold-border shadow-playful w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b-3 border-slate-200">
                <h2 className="text-lg font-black uppercase tracking-wider">All Participants ({gala.members.length})</h2>
                <button
                  onClick={() => setShowAllParticipants(false)}
                  className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-600">close</span>
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[calc(80vh-80px)]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {gala.members.map(({ user, role }) => (
                    <div key={user.id} className="flex flex-col items-center gap-2 p-3 bg-[#f8f6f5] rounded-lg bold-border">
                      <div className="size-12 rounded-full bg-[#ff5833] bold-border flex items-center justify-center">
                        <span className="text-white font-black text-base">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="w-full text-center">
                        <p className="font-black text-[10px] truncate">{user.name}</p>
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-black uppercase mt-1 ${
                          role === "organizer" 
                            ? "bg-[#ff5833]/10 text-[#ff5833] border border-[#ff5833]" 
                            : "bg-slate-100 text-slate-600 border border-slate-300"
                        }`}>
                          {role === "organizer" ? "Organizer" : "Member"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
