"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GalaLogo from "@/components/GalaLogo";
import SqueezeLoader from "@/components/SqueezeLoader";
import { useAuth } from "@/contexts/AuthContext";
import UserDropdown from "@/components/UserDropdown";
import AlertDialog from "@/components/AlertDialog";
import OverviewTab from "@/components/dashboard/OverviewTab";
import VotingTab from "@/components/dashboard/VotingTab";
import TasksTab from "@/components/dashboard/TasksTab";
import BudgetTab from "@/components/dashboard/BudgetTab";
import MemoriesTab from "@/components/dashboard/MemoriesTab";
import ItineraryTab from "@/components/dashboard/ItineraryTab";
import type {
  GalaWithMembers,
  SuggestionWithVotes,
  TaskWithAssignee,
  ExpenseWithDetails,
  ItineraryItemWithCreator,
  User,
  Gala,
  GalaMember,
  Suggestion,
  Vote,
  Task,
  Expense,
  ExpenseAssignment,
  Memory,
} from "@/types/database";

type Tab = "overview" | "voting" | "tasks" | "budget" | "itinerary" | "memories";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "voting", label: "Voting", icon: "how_to_vote" },
  { id: "tasks", label: "Tasks", icon: "task_alt" },
  { id: "budget", label: "Budget", icon: "payments" },
  { id: "itinerary", label: "Itinerary", icon: "event_note" },
  { id: "memories", label: "Memories", icon: "photo_library" },
];

export default function GalaDashboard() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [gala, setGala] = useState<GalaWithMembers | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionWithVotes[]>([]);
  const [tasks, setTasks] = useState<TaskWithAssignee[]>([]);
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItemWithCreator[]>([]);
  const [memories, setMemories] = useState<(Memory & { user?: User })[]>([]);
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [alertDialog, setAlertDialog] = useState<{isOpen: boolean; title: string; message: string; type: "error"|"success"|"warning"|"info"}>({isOpen: false, title: "", message: "", type: "error"});
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [copiedItem, setCopiedItem] = useState<"link" | "code" | null>(null);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedItem("link");
    setShowInviteDropdown(false);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(gala?.invite_code || "");
    setCopiedItem("code");
    setShowInviteDropdown(false);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAlertDialog({isOpen: true, title: "Image Too Large", message: "Image must be less than 2MB", type: "warning"});
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setCoverImage(dataUrl);
      
      // Save to database
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("galas")
        .update({ cover_image: dataUrl })
        .eq("id", id);
      
      if (updateError) {
        console.error("Failed to save cover image:", updateError);
        setAlertDialog({isOpen: true, title: "Upload Failed", message: "Failed to save cover image. Please try again.", type: "error"});
        setCoverImage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    // Fetch gala + members
    const { data: galaData, error: galaErr } = await supabase
      .from("galas")
      .select("*")
      .eq("id", id)
      .single();

    if (galaErr || !galaData) {
      setError("Gala not found.");
      setLoading(false);
      return;
    }

    const gala = galaData as Gala;
    
    // Set cover image from database
    if (gala.cover_image) {
      setCoverImage(gala.cover_image);
    }

    // Fetch members + user details
    const { data: rawMembers } = await supabase
      .from("gala_members")
      .select("*")
      .eq("gala_id", id);
    const membersData = (rawMembers || []) as GalaMember[];

    const memberUserIds = membersData.map((m) => m.user_id);
    const { data: rawUsers } = await supabase
      .from("users")
      .select("*")
      .in("id", memberUserIds.length ? memberUserIds : ["00000000-0000-0000-0000-000000000000"]);
    const usersData = (rawUsers || []) as User[];

    const { data: rawOrganizer } = await supabase
      .from("users")
      .select("*")
      .eq("id", gala.organizer_id)
      .single();
    const organizerData = rawOrganizer as User | null;

    const membersWithUsers = membersData.map((m) => ({
      ...m,
      user: usersData.find((u) => u.id === m.user_id) || {
        id: m.user_id,
        name: "Unknown",
        email: null,
        avatar: null,
        created_at: "",
      },
    }));

    setGala({
      ...gala,
      members: membersWithUsers,
      organizer: organizerData || { id: gala.organizer_id, name: "Unknown", email: null, avatar: null, created_at: "" },
    });

    setInviteLink(
      typeof window !== "undefined"
        ? `${window.location.origin}/join?code=${gala.invite_code}`
        : `/join?code=${gala.invite_code}`
    );

    // Fetch suggestions + votes
    const { data: rawSuggestions } = await supabase
      .from("suggestions")
      .select("*")
      .eq("gala_id", id)
      .order("created_at", { ascending: false });
    const suggestionsData = (rawSuggestions || []) as Suggestion[];

    const { data: rawVotes } = await supabase
      .from("votes")
      .select("*")
      .in(
        "suggestion_id",
        suggestionsData.map((s) => s.id)
      );
    const votesData = (rawVotes || []) as Vote[];

    const userId = currentUser?.id;
    const suggestionsWithVotes: SuggestionWithVotes[] = suggestionsData.map((s) => {
      const suggVotes = votesData.filter((v) => v.suggestion_id === s.id);
      return {
        ...s,
        vote_count: suggVotes.length,
        user_has_voted: userId ? suggVotes.some((v) => v.user_id === userId) : false,
        author_name: usersData.find((u) => u.id === s.user_id)?.name,
      };
    });
    setSuggestions(suggestionsWithVotes);

    // Fetch tasks
    const { data: rawTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("gala_id", id)
      .order("created_at", { ascending: false });
    const tasksData = (rawTasks || []) as Task[];

    const tasksWithAssignees: TaskWithAssignee[] = tasksData.map((t) => ({
      ...t,
      assignee_name: usersData.find((u) => u.id === t.assigned_to)?.name,
      assignee_avatar: usersData.find((u) => u.id === t.assigned_to)?.avatar,
    }));
    setTasks(tasksWithAssignees);

    // Fetch expenses with assignments
    const { data: rawExpenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("gala_id", id)
      .order("created_at", { ascending: false });
    const expensesData = (rawExpenses || []) as Expense[];

    // Fetch all expense assignments
    const { data: rawAssignments } = await supabase
      .from("expense_assignments")
      .select("*")
      .in("expense_id", expensesData.map(e => e.id));
    const assignmentsData = (rawAssignments || []) as ExpenseAssignment[];

    const expensesWithDetails: ExpenseWithDetails[] = expensesData.map((e) => ({
      ...e,
      creator_name: usersData.find((u) => u.id === e.created_by)?.name,
      assignments: assignmentsData
        .filter(a => a.expense_id === e.id)
        .map(a => ({
          ...a,
          user_name: usersData.find((u) => u.id === a.user_id)?.name,
          user_avatar: usersData.find((u) => u.id === a.user_id)?.avatar,
        })),
    }));
    setExpenses(expensesWithDetails);

    // Fetch memories
    const { data: rawMemories } = await supabase
      .from("memories")
      .select("*")
      .eq("gala_id", id)
      .order("created_at", { ascending: false });
    const memoriesData = (rawMemories || []) as Memory[];

    const memoriesWithUsers = memoriesData.map((m) => ({
      ...m,
      user: usersData.find((u) => u.id === m.user_id),
    }));
    setMemories(memoriesWithUsers);

    // Fetch itinerary items
    const { data: rawItinerary } = await supabase
      .from("itinerary_items")
      .select("*")
      .eq("gala_id", id)
      .order("scheduled_time", { ascending: true });
    const itineraryData = (rawItinerary || []) as ItineraryItemWithCreator[];
    
    const itineraryWithCreators = itineraryData.map((item) => ({
      ...item,
      creator_name: usersData.find((u) => u.id === item.created_by)?.name,
    }));
    setItineraryItems(itineraryWithCreators);

    setLoading(false);
  }, [id, currentUser]);

  // Optimized refresh functions for specific data
  const refreshTasks = useCallback(async () => {
    if (!gala) return;
    const supabase = createClient();
    
    const { data: rawTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("gala_id", id)
      .order("created_at", { ascending: false });
    const tasksData = (rawTasks || []) as Task[];

    const usersData = gala.members.map(m => m.user);
    const tasksWithAssignees: TaskWithAssignee[] = tasksData.map((t) => ({
      ...t,
      assignee_name: usersData.find((u) => u.id === t.assigned_to)?.name,
      assignee_avatar: usersData.find((u) => u.id === t.assigned_to)?.avatar,
    }));
    setTasks(tasksWithAssignees);
  }, [id, gala]);

  const refreshExpenses = useCallback(async () => {
    if (!gala) return;
    const supabase = createClient();
    
    // Refresh gala data (for budget updates)
    const { data: galaData } = await supabase
      .from("galas")
      .select("*")
      .eq("id", id)
      .single();
    
    if (galaData) {
      setGala(prev => prev ? { ...prev, ...galaData } : prev);
    }
    
    const { data: rawExpenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("gala_id", id)
      .order("created_at", { ascending: false });
    const expensesData = (rawExpenses || []) as Expense[];

    // Fetch all expense assignments
    const { data: rawAssignments } = await supabase
      .from("expense_assignments")
      .select("*")
      .in("expense_id", expensesData.map(e => e.id));
    const assignmentsData = (rawAssignments || []) as ExpenseAssignment[];

    const usersData = gala.members.map(m => m.user);
    const expensesWithDetails: ExpenseWithDetails[] = expensesData.map((e) => ({
      ...e,
      creator_name: usersData.find((u) => u.id === e.created_by)?.name,
      assignments: assignmentsData
        .filter(a => a.expense_id === e.id)
        .map(a => ({
          ...a,
          user_name: usersData.find((u) => u.id === a.user_id)?.name,
          user_avatar: usersData.find((u) => u.id === a.user_id)?.avatar,
        })),
    }));
    setExpenses(expensesWithDetails);
  }, [id, gala]);

  const refreshSuggestions = useCallback(async () => {
    if (!gala) return;
    const supabase = createClient();
    
    const { data: rawSuggestions } = await supabase
      .from("suggestions")
      .select("*")
      .eq("gala_id", id)
      .order("created_at", { ascending: false });
    const suggestionsData = (rawSuggestions || []) as Suggestion[];

    const { data: rawVotes } = await supabase
      .from("votes")
      .select("*")
      .in(
        "suggestion_id",
        suggestionsData.map((s) => s.id)
      );
    const votesData = (rawVotes || []) as Vote[];

    const userId = currentUser?.id;
    const usersData = gala.members.map(m => m.user);
    const suggestionsWithVotes: SuggestionWithVotes[] = suggestionsData.map((s) => {
      const suggVotes = votesData.filter((v) => v.suggestion_id === s.id);
      return {
        ...s,
        vote_count: suggVotes.length,
        user_has_voted: userId ? suggVotes.some((v) => v.user_id === userId) : false,
        author_name: usersData.find((u) => u.id === s.user_id)?.name,
      };
    });
    setSuggestions(suggestionsWithVotes);
  }, [id, gala, currentUser]);

  const refreshMemories = useCallback(async () => {
    if (!gala) return;
    const supabase = createClient();
    
    const { data: rawMemories } = await supabase
      .from("memories")
      .select("*")
      .eq("gala_id", id)
      .order("created_at", { ascending: false });
    const memoriesData = (rawMemories || []) as Memory[];

    const usersData = gala.members.map(m => m.user);
    const memoriesWithUsers = memoriesData.map((m) => ({
      ...m,
      user: usersData.find((u) => u.id === m.user_id),
    }));
    setMemories(memoriesWithUsers);
  }, [id, gala]);

  const refreshItinerary = useCallback(async () => {
    if (!gala) return;
    const supabase = createClient();
    
    const { data: rawItinerary } = await supabase
      .from("itinerary_items")
      .select("*")
      .eq("gala_id", id)
      .order("scheduled_time", { ascending: true });
    const itineraryData = (rawItinerary || []) as ItineraryItemWithCreator[];

    const usersData = gala.members.map(m => m.user);
    const itineraryWithCreators = itineraryData.map((item) => ({
      ...item,
      creator_name: usersData.find((u) => u.id === item.created_by)?.name,
    }));
    setItineraryItems(itineraryWithCreators);
  }, [id, gala]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <SqueezeLoader />;
  }

  if (error || !gala) {
    return (
      <div className="min-h-screen bg-[#f8f6f5] flex items-center justify-center">
        <div className="text-center bg-white rounded-xl bold-border p-12 shadow-playful max-w-md">
          <span className="material-symbols-outlined text-slate-300 text-6xl block mb-4">error</span>
          <p className="font-black text-2xl mb-2">{error || "Gala not found"}</p>
          <Link href="/" className="text-[#ff5833] font-black hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isMember = currentUser
    ? gala.members.some((m) => m.user_id === currentUser.id)
    : false;

  return (
    <div className="min-h-screen bg-[#f8f6f5]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');`}</style>

      {/* Header */}
      <header className="flex items-center justify-between bg-white border-b-4 border-slate-900 px-6 md:px-10 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <GalaLogo />
          <div className="hidden md:block h-8 w-px bg-slate-200" />
          <div className="hidden md:block">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Active Gala
            </p>
            <p className="font-black text-slate-900 leading-tight">{gala.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowInviteDropdown(!showInviteDropdown)}
              className="h-10 px-4 bg-[#ff5833] text-white font-black rounded-full bold-border text-sm btn-push flex items-center gap-2 hover:bg-[#ff6b47] transition-colors"
            >
              <span className="material-symbols-outlined text-base">{copiedItem ? "check" : "person_add"}</span>
              <span className="hidden sm:inline">
                {copiedItem === "link" ? "Link Copied!" : copiedItem === "code" ? "Code Copied!" : "Invite Friends"}
              </span>
              <span className="material-symbols-outlined text-sm">{showInviteDropdown ? "expand_less" : "expand_more"}</span>
            </button>
            
            {showInviteDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowInviteDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl bold-border shadow-playful z-50">
                  <button
                    onClick={copyInviteLink}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b-2 border-slate-200 rounded-t-xl"
                  >
                    <span className="material-symbols-outlined text-[#ff5833]">link</span>
                    <div className="flex-1 text-left">
                      <p className="font-black text-sm text-slate-900">Copy Link</p>
                      <p className="text-[10px] text-slate-500 font-medium">Share full URL</p>
                    </div>
                  </button>
                  <button
                    onClick={copyInviteCode}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors rounded-b-xl"
                  >
                    <span className="material-symbols-outlined text-[#ff5833]">tag</span>
                    <div className="flex-1 text-left">
                      <p className="font-black text-sm text-slate-900">Copy Code</p>
                      <p className="text-[10px] text-slate-500 font-medium">{gala.invite_code}</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
          {currentUser ? (
            <UserDropdown redirectAfterLogout="/" />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={`/login?redirect=/gala/${id}`}
                className="h-10 px-5 bg-white font-black rounded-full bold-border text-sm btn-push flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">person</span>
                Log In
              </Link>
              <Link
                href={`/join?code=${gala.invite_code}`}
                className="h-10 px-5 bg-[#ff5833] text-white font-black rounded-full bold-border text-sm btn-push flex items-center"
              >
                Join Gala
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Cover */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden border-b-4 border-slate-900 group">
        {/* Background: uploaded image or white default */}
        {coverImage ? (
          <img
            src={coverImage}
            alt="Gala cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-white" />
        )}

        {/* Overlay: darker when image is set for text legibility */}
        <div className={`absolute inset-0 ${coverImage ? "bg-gradient-to-t from-black/60 to-transparent" : "bg-gradient-to-t from-black/20 to-transparent"}`} />

        {/* Edit cover button */}
        <label className="absolute top-4 right-4 cursor-pointer z-10">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
          <div className="flex items-center gap-2 bg-white/90 hover:bg-white border-2 border-slate-900 rounded-full px-4 py-2 shadow-playful-sm btn-push transition-all">
            <span className="material-symbols-outlined text-slate-700 text-base">
              {coverImage ? "edit" : "add_photo_alternate"}
            </span>
            <span className="font-black text-sm text-slate-700 hidden sm:block">
              {coverImage ? "Change Cover" : "Add Cover"}
            </span>
          </div>
        </label>

        <div className="absolute bottom-0 left-0 p-6 md:p-10 flex justify-between items-end w-full">
          <div>
            <span className="bg-[#ff5833] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
              {gala.stage}
            </span>
            <h1 className={`text-3xl md:text-5xl font-black leading-tight uppercase ${coverImage ? "text-white" : "text-slate-900"}`}>
              {gala.title}
            </h1>
            {gala.description && (
              <p className={`font-medium mt-1 max-w-xl ${coverImage ? "text-white/70" : "text-slate-500"}`}>
                {gala.description}
              </p>
            )}
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white rounded-full bold-border px-4 py-2">
            <div className="flex -space-x-2">
              {gala.members.slice(0, 3).map(({ user }) => (
                <div
                  key={user.id}
                  className="size-8 rounded-full bg-[#ff5833] border-2 border-white flex items-center justify-center"
                >
                  <span className="text-white text-xs font-black">
                    {user.name.charAt(0)}
                  </span>
                </div>
              ))}
            </div>
            <span className="font-black text-sm text-slate-700">
              {gala.members.length} members
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b-4 border-slate-900 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-6 py-4 font-black text-sm uppercase tracking-wide transition-all border-b-4 ${
                  tab === t.id
                    ? "border-[#ff5833] text-[#ff5833]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <span className="material-symbols-outlined text-base">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!isMember && currentUser && (
          <div className="mb-6 bg-yellow-50 border-3 border-yellow-400 rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-yellow-600">warning</span>
            <p className="font-bold text-yellow-800 flex-1">
              You&apos;re viewing as a guest. Join to participate!
            </p>
            <Link
              href={`/join?code=${gala.invite_code}`}
              className="bg-yellow-400 text-yellow-900 font-black px-4 py-2 rounded-lg border-2 border-yellow-700 btn-push text-sm"
            >
              Join Now
            </Link>
          </div>
        )}

        {tab === "overview" && (
          <OverviewTab
            gala={gala}
            tasks={tasks}
            expenses={expenses}
            suggestions={suggestions}
            userId={currentUser?.id || ""}
            onRefresh={fetchData}
          />
        )}
        {tab === "voting" && (
          <VotingTab
            galaId={id}
            userId={currentUser?.id || ""}
            suggestions={suggestions}
            onRefresh={refreshSuggestions}
          />
        )}
        {tab === "tasks" && (
          <TasksTab
            galaId={id}
            userId={currentUser?.id || ""}
            tasks={tasks}
            members={gala.members}
            onRefresh={refreshTasks}
          />
        )}
        {tab === "budget" && (
          <BudgetTab
            galaId={id}
            userId={currentUser?.id || ""}
            expenses={expenses}
            members={gala.members}
            proposedBudget={gala.proposed_budget_per_person}
            onRefresh={refreshExpenses}
          />
        )}
        {tab === "itinerary" && (
          <ItineraryTab
            galaId={id}
            userId={currentUser?.id || ""}
            items={itineraryItems}
            onRefresh={refreshItinerary}
          />
        )}
        {tab === "memories" && (
          <MemoriesTab
            galaId={id}
            userId={currentUser?.id || ""}
            memories={memories}
            onRefresh={refreshMemories}
          />
        )}
      </main>

      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={() => setAlertDialog({...alertDialog, isOpen: false})}
      />
    </div>
  );
}
