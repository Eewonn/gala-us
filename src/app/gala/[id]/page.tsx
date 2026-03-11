"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GalaLogo from "@/components/GalaLogo";
import OverviewTab from "@/components/dashboard/OverviewTab";
import VotingTab from "@/components/dashboard/VotingTab";
import TasksTab from "@/components/dashboard/TasksTab";
import BudgetTab from "@/components/dashboard/BudgetTab";
import MemoriesTab from "@/components/dashboard/MemoriesTab";
import type {
  GalaWithMembers,
  SuggestionWithVotes,
  TaskWithAssignee,
  ExpenseWithPayer,
  User,
  Gala,
  GalaMember,
  Suggestion,
  Vote,
  Task,
  Expense,
  Memory,
} from "@/types/database";

type Tab = "overview" | "voting" | "tasks" | "budget" | "memories";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "voting", label: "Voting", icon: "how_to_vote" },
  { id: "tasks", label: "Tasks", icon: "task_alt" },
  { id: "budget", label: "Budget", icon: "payments" },
  { id: "memories", label: "Memories", icon: "photo_library" },
];

export default function GalaDashboard() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [gala, setGala] = useState<GalaWithMembers | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionWithVotes[]>([]);
  const [tasks, setTasks] = useState<TaskWithAssignee[]>([]);
  const [expenses, setExpenses] = useState<ExpenseWithPayer[]>([]);
  const [memories, setMemories] = useState<(Memory & { user?: User })[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("galaus_user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

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
        avatar: null,
        created_at: "",
      },
    }));

    setGala({
      ...gala,
      members: membersWithUsers,
      organizer: organizerData || { id: gala.organizer_id, name: "Unknown", avatar: null, created_at: "" },
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

    // Fetch expenses
    const { data: rawExpenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("gala_id", id)
      .order("created_at", { ascending: false });
    const expensesData = (rawExpenses || []) as Expense[];

    const expensesWithPayers: ExpenseWithPayer[] = expensesData.map((e) => ({
      ...e,
      payer_name: usersData.find((u) => u.id === e.paid_by)?.name,
    }));
    setExpenses(expensesWithPayers);

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

    setLoading(false);
  }, [id, currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f5] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[#ff5833] text-6xl animate-spin block mb-4">
            progress_activity
          </span>
          <p className="font-black text-xl">Loading your Gala...</p>
        </div>
      </div>
    );
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
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-xs text-slate-400 font-bold">Logged in as</p>
                <p className="font-black text-sm">{currentUser.name}</p>
              </div>
              <div className="size-10 rounded-full bg-[#ff5833] bold-border flex items-center justify-center">
                <span className="text-white font-black">
                  {currentUser.name.charAt(0)}
                </span>
              </div>
            </div>
          ) : (
            <Link
              href={`/join?code=${gala.invite_code}`}
              className="h-10 px-5 bg-[#ff5833] text-white font-black rounded-full bold-border text-sm btn-push flex items-center"
            >
              Join Gala
            </Link>
          )}
        </div>
      </header>

      {/* Cover */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden border-b-4 border-slate-900 bg-gradient-to-br from-[#ff5833]/30 via-yellow-100 to-slate-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10 flex justify-between items-end w-full">
          <div>
            <span className="bg-[#ff5833] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
              {gala.stage}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase">
              {gala.title}
            </h1>
            {gala.description && (
              <p className="text-white/70 font-medium mt-1 max-w-xl">
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
            inviteLink={inviteLink}
          />
        )}
        {tab === "voting" && (
          <VotingTab
            galaId={id}
            userId={currentUser?.id || ""}
            suggestions={suggestions}
            onRefresh={fetchData}
          />
        )}
        {tab === "tasks" && (
          <TasksTab
            galaId={id}
            userId={currentUser?.id || ""}
            tasks={tasks}
            members={gala.members}
            onRefresh={fetchData}
          />
        )}
        {tab === "budget" && (
          <BudgetTab
            galaId={id}
            userId={currentUser?.id || ""}
            expenses={expenses}
            members={gala.members}
            onRefresh={fetchData}
          />
        )}
        {tab === "memories" && (
          <MemoriesTab
            galaId={id}
            userId={currentUser?.id || ""}
            memories={memories}
            onRefresh={fetchData}
          />
        )}
      </main>
    </div>
  );
}
